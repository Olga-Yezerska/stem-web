"""Валідація та нормалізація завантажених зображень і еталонів

Ім'я файлу від користувача на диск не потрапляє: воно лише повертається у відповіді
(після очищення), а для обробки використовуються тимчасові файли з фіксованими іменами
"""
import io
import re
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageOps

from . import config

Image.MAX_IMAGE_PIXELS = config.MAX_PIXELS


class UploadError(ValueError):
    """Помилка валідації файлу; повідомлення можна показувати користувачу."""

    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


@dataclass
class PreparedImage:
    image: Image.Image        # RGB, вже зменшене за потреби
    ext: str                  # ".jpg" або ".png" — у якому форматі зберігати
    name: str                 # очищене ім'я для відображення
    original_size: tuple[int, int]
    resized: bool


def safe_name(filename: str) -> str:
    name = (filename or "image").replace("\\", "/").split("/")[-1]
    name = re.sub(r"[\x00-\x1f\x7f]", "", name).strip()
    return (name or "image")[:120]


def _check_extension(filename: str) -> str:
    ext = Path(filename or "").suffix.lower()
    if ext not in config.ALLOWED_EXTENSIONS:
        raise UploadError("Непідтримуване розширення файлу. Дозволені: JPG, PNG, BMP, WEBP.", 415)
    return ext


def _open_validated(data: bytes) -> Image.Image:
    """Відкриває картинку, перевіряє формат і розмір ДО повного розпакування."""
    try:
        img = Image.open(io.BytesIO(data))
        fmt = img.format
        width, height = img.size
    except Exception:
        raise UploadError("Файл не є коректним зображенням.", 415)
    if fmt not in config.ALLOWED_FORMATS:
        raise UploadError("Непідтримуваний формат. Дозволені: JPG, PNG, BMP, WEBP.", 415)
    if width * height > config.MAX_PIXELS:
        raise UploadError("Зображення завелике за кількістю пікселів.", 413)
    try:
        img = ImageOps.exif_transpose(img)
        img.load()
    except Exception:
        raise UploadError("Не вдалося прочитати зображення (файл пошкоджено).", 415)
    return img


def prepare_image(data: bytes, filename: str) -> PreparedImage:
    ext = _check_extension(filename)
    img = _open_validated(data).convert("RGB")
    original_size = img.size

    resized = max(img.size) > config.MAX_SIDE
    if resized:
        scale = config.MAX_SIDE / max(img.size)
        img = img.resize((max(1, round(img.width * scale)), max(1, round(img.height * scale))),
                         Image.LANCZOS)
    return PreparedImage(
        image=img,
        ext=".jpg" if ext in (".jpg", ".jpeg") else ".png",
        name=safe_name(filename),
        original_size=original_size,
        resized=resized,
    )


def prepare_ground_truth(data: bytes, filename: str, target: PreparedImage) -> Image.Image:
    """Еталон у відтінках сірого, підігнаний під розмір знімка."""
    _check_extension(filename)
    gt = _open_validated(data).convert("L")

    ow, oh = target.original_size
    if abs(ow / oh - gt.width / gt.height) / (ow / oh) > config.GT_ASPECT_TOLERANCE:
        raise UploadError("Еталон має іншу пропорцію сторін, ніж зображення.")

    if gt.size != target.image.size:
        gt = gt.resize(target.image.size, Image.NEAREST)  # NEAREST зберігає межі маски
    return gt
