from pydantic import BaseModel, Field

from app.schemas.common import ConfidenceTrace, ExplanationTrace, TimestampedResponse


class HistoricalRegime(BaseModel):
    id: str
    year: int
    label: str
    x: float
    y: float
    color: str
    size: float
    description: str
    drivers: list[str]
    assets: str
    similarity: int = Field(..., ge=0, le=100)
    trace_id: str


class HistoricalConnection(BaseModel):
    from_regime: str = Field(alias="from")
    to_regime: str = Field(alias="to")

    model_config = {"populate_by_name": True}


class HistoricalAnaloguesResponse(TimestampedResponse):
    regimes: list[HistoricalRegime]
    connections: list[HistoricalConnection]
    confidence: ConfidenceTrace
    explanation: ExplanationTrace
