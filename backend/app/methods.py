from fastapi import HTTPException
from .core import ImageProcessingFacade
from .schemas import (FilterInfo, IncompatiblePair, MethodsOut, ParamSpec, PreprocessingInfo)

PREPROCESSING_INFO = {
    "Default": "Без попередньої обробки.",
    "White Balance": "Вирівнювання балансу білого.",
    "Histogram Equalization": "Вирівнювання гістограми яскравості (результат сірий).",
    "Sharpen Filter": "Підвищення різкості (результат сірий).",
    "CLAHE": "Адаптивне вирівнювання гістограми з обмеженням контрасту (результат сірий).",
    "Dark channel": "Dark channel prior: послаблення серпанку на знімку.",
}

FILTER_INFO = {
    "Canny": ("Canny", "Детектор контурів Канні.", None),
    "Directional": ("Directional", "Спрямований фільтр виділення контурів.", None),
    "Pruitt": ("Pruitt (Prewitt)", "Оператор Превітт для виділення контурів.", None),
    "Tracehold": ("Threshold", "Порогова сегментація: піксель білий, якщо всі канали RGB вищі за поріг.",
                  ParamSpec(type="int", default=200, min=0, max=255, step=1)),
    "Harris": ("Harris", "Детектор кутів Гарріса; поріг — частка від максимуму відгуку.",
               ParamSpec(type="float", default=0.01, min=0.0001, max=1.0, step=0.001)),
    "FAST": ("FAST", "Детектор кутів FAST; параметр — різниця яскравості.",
             ParamSpec(type="int", default=20, min=1, max=255, step=1)),
}

# Tracehold працює лише з RGB, а ці препроцесинги повертають сіре зображення
# (перевірено прогоном усіх 36 комбінацій).
_GRAY_PRE = ("Histogram Equalization", "Sharpen Filter", "CLAHE")
INCOMPATIBLE = {
    (p, "Tracehold"): "Фільтр Threshold потребує кольорового (RGB) входу, а цей препроцесинг повертає сіре зображення."
    for p in _GRAY_PRE
}

PREPROCESSING_NAMES = list(PREPROCESSING_INFO)

# Страховка: реєстр не повинен розходитися з ядром.
_core_pre = set(ImageProcessingFacade().pre_strategies)
assert _core_pre == set(PREPROCESSING_INFO), f"Реєстр препроцесингів розходиться з core: {_core_pre}"


def methods_payload() -> MethodsOut:
    return MethodsOut(
        preprocessing=[PreprocessingInfo(name=n, description=d) for n, d in PREPROCESSING_INFO.items()],
        filters=[FilterInfo(name=n, label=l, description=d, param=p) for n, (l, d, p) in FILTER_INFO.items()],
        incompatible=[IncompatiblePair(preprocessing=p, filter=f, reason=r) for (p, f), r in INCOMPATIBLE.items()],
    )


def check_preprocessing(name: str) -> str:
    if name not in PREPROCESSING_INFO:
        raise HTTPException(422, f"Невідомий препроцесинг: {name!r}")
    return name


def normalize_filter(name: str, param: float | None) -> tuple[str, float | int | None]:
    """Перевіряє фільтр і параметр; підставляє значення за замовчуванням."""
    if name not in FILTER_INFO:
        raise HTTPException(422, f"Невідомий фільтр: {name!r}")
    param_spec = FILTER_INFO[name][2]
    if param_spec is None:
        return name, None
    value = param if param is not None else param_spec.default
    if not (param_spec.min <= value <= param_spec.max):
        raise HTTPException(422, f"Параметр фільтра {name} має бути в межах "
                                 f"[{param_spec.min}; {param_spec.max}]")
    if param_spec.type == "int":
        value = int(round(value))
    return name, value
