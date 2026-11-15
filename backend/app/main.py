import asyncio
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool

from . import config, methods, processing, uploads
from .schemas import MethodsOut, ProcessOut

app = FastAPI(title="Aerial Edge Detection API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

_slots = asyncio.Semaphore(config.MAX_CONCURRENT)


@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Cache-Control", "no-store")
    return response


async def read_limited(upload: UploadFile) -> bytes:
    chunks, size = [], 0
    while chunk := await upload.read(1024 * 1024):
        size += len(chunk)
        if size > config.MAX_UPLOAD_BYTES:
            raise HTTPException(413, f"Файл перевищує {config.MAX_UPLOAD_BYTES // (1024 * 1024)} МБ.")
        chunks.append(chunk)
    if size == 0:
        raise HTTPException(400, "Порожній файл.")
    return b"".join(chunks)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/methods", response_model=MethodsOut)
def get_methods():
    return methods.methods_payload()


@app.post("/api/process", response_model=ProcessOut)
async def process(
    file: UploadFile = File(...),
    ground_truth: Optional[UploadFile] = File(None),
    preprocessing: str = Form("Default", max_length=40),
    filter: str = Form(..., max_length=40),
    param: Optional[float] = Form(None),
):
    # 1. Дешеві перевірки спочатку
    pre = methods.check_preprocessing(preprocessing)
    flt, prm = methods.normalize_filter(filter, param)
    if (pre, flt) in methods.INCOMPATIBLE:
        raise HTTPException(422, methods.INCOMPATIBLE[(pre, flt)])

    # 2. Файли
    image_bytes = await read_limited(file)
    gt_bytes = None
    if ground_truth is not None and ground_truth.filename:
        gt_bytes = await read_limited(ground_truth)

    try:
        prepared = await run_in_threadpool(uploads.prepare_image, image_bytes, file.filename or "image")
        gt = None
        if gt_bytes is not None:
            gt = await run_in_threadpool(uploads.prepare_ground_truth, gt_bytes,
                                         ground_truth.filename, prepared)
    except uploads.UploadError as e:
        raise HTTPException(e.status, str(e))

    # 3. Обробка (важка, тому в пулі потоків і з обмеженням паралельності)
    async with _slots:
        try:
            out = await run_in_threadpool(processing.process, prepared, gt, pre, flt, prm)
        except Exception as e:  # помилка алгоритму не повинна ховатись за «500 без пояснень»
            raise HTTPException(500, f"Не вдалося обробити зображення: {type(e).__name__}: {e}"[:300])

    return {
        "name": prepared.name,
        "width": prepared.image.width,
        "height": prepared.image.height,
        "original_width": prepared.original_size[0],
        "original_height": prepared.original_size[1],
        "resized": prepared.resized,
        "has_gt": gt is not None,
        "preprocessing": pre,
        "filter": flt,
        "param": prm,
        **out,
    }


# Фронтенд (папка frontend поруч з backend) віддається цим же сервером.
# Монтуємо в кінці, щоб маршрути /api мали пріоритет.
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"
if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
