"""Pydantic-схеми відповідей API"""
from typing import Literal, Optional
from pydantic import BaseModel

class ParamSpec(BaseModel):
    type: Literal["int", "float"]
    default: float
    min: float
    max: float
    step: float


class PreprocessingInfo(BaseModel):
    name: str
    description: str


class FilterInfo(BaseModel):
    name: str
    label: str
    description: str
    param: Optional[ParamSpec] = None


class IncompatiblePair(BaseModel):
    preprocessing: str
    filter: str
    reason: str


class MethodsOut(BaseModel):
    preprocessing: list[PreprocessingInfo]
    filters: list[FilterInfo]
    incompatible: list[IncompatiblePair]


class MetricsOut(BaseModel):
    mse: Optional[float] = None
    ssim: Optional[float] = None
    psnr: Optional[float] = None
    fom: Optional[float] = None      # потребує еталона
    auc_roc: Optional[float] = None  # потребує еталона


class ProcessOut(BaseModel):
    name: str
    width: int                       # розмір, з яким працювали алгоритми
    height: int
    original_width: int
    original_height: int
    resized: bool                    # true, якщо знімок автоматично зменшено
    has_gt: bool
    preprocessing: str
    filter: str
    param: Optional[float] = None
    preprocessed: Optional[str] = None   # data URL; null для Default (препроцесингу немає)
    result: str                          # data URL
    metrics: MetricsOut
    duration_ms: int
