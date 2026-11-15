"""Одна обробка: препроцесинг + фільтр + метрики. Повторює ImageApp._process_and_display 
"""
import base64
import math
import tempfile
import time
from pathlib import Path
from typing import Optional

from PIL import Image

from .core import ImageProcessingFacade, save_image
from .uploads import PreparedImage

_MIME = {".jpg": "image/jpeg", ".png": "image/png"}


def _num(value) -> Optional[float]:
    """np.float64 -> float; None / inf / nan -> None (JSON не підтримує inf)."""
    if value is None:
        return None
    value = float(value)
    return value if math.isfinite(value) else None


def _data_url(path: str) -> str:
    p = Path(path)
    mime = _MIME.get(p.suffix.lower(), "image/png")
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode("ascii")


def process(prepared: PreparedImage, gt: Optional[Image.Image],
            pre_name: str, filter_name: str, param) -> dict:
    started = time.perf_counter()
    with tempfile.TemporaryDirectory(prefix="stem_") as tmp:
        original_path = str(Path(tmp) / f"original{prepared.ext}")
        if prepared.ext == ".jpg":
            prepared.image.save(original_path, quality=95)
        else:
            prepared.image.save(original_path)

        facade = ImageProcessingFacade()
        if gt is not None:
            gt_path = str(Path(tmp) / "ground_truth.png")
            gt.save(gt_path)
            facade.metrics.set_ground_truth(gt_path)

        # Обробляємо саме той файл, з яким потім порівнюємо (як у stem.py)
        with Image.open(original_path) as im:
            img = im.convert("RGB")

        preprocessed, result, suffix = facade.process_image(img, pre_name, filter_name, filter_param=param)

        pre = facade.pre_strategies[pre_name]
        pre_path = save_image(preprocessed, original_path, pre.suffix) if pre.suffix else None
        result_path = save_image(result, original_path, suffix)

        mse = facade.metrics.distortion_rate(original_path, result_path)
        metrics = {
            "mse": _num(mse),
            "ssim": _num(facade.metrics.ssim_rate(original_path, result_path)),
            "psnr": _num(facade.metrics.psnr_rate(mse)),
            "fom": _num(facade.metrics.fom_rate(result_path)),
            "auc_roc": _num(facade.metrics.auc_roc_rate(result_path)),
        }
        return {
            "preprocessed": _data_url(pre_path) if pre_path else None,
            "result": _data_url(result_path),
            "metrics": metrics,
            "duration_ms": int((time.perf_counter() - started) * 1000),
        }
