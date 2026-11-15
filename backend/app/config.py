"""Налаштування бекенду"""
import os

#Обмеження завантажень
MAX_UPLOAD_BYTES = int(os.getenv("STEM_MAX_UPLOAD_MB", "15")) * 1024 * 1024
MAX_PIXELS = 50_000_000         
MAX_SIDE = int(os.getenv("STEM_MAX_SIDE", "1024"))  # довша сторона після автозменшення
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
ALLOWED_FORMATS = {"JPEG", "PNG", "BMP", "WEBP"}
GT_ASPECT_TOLERANCE = 0.02      

MAX_CONCURRENT = int(os.getenv("STEM_MAX_CONCURRENT", "2"))

CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("STEM_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if o.strip()
]
