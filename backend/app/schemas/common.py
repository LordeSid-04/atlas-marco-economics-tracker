from datetime import datetime, timezone

from pydantic import BaseModel, Field


class ConfidenceComponents(BaseModel):
    freshness: float = Field(..., ge=0.0, le=1.0)
    coverage: float = Field(..., ge=0.0, le=1.0)
    stability: float = Field(..., ge=0.0, le=1.0)


class ConfidenceTrace(BaseModel):
    score: int = Field(..., ge=0, le=100)
    components: ConfidenceComponents


class FactorContribution(BaseModel):
    factor: str
    contribution: float
    weight: float
    value: float


class ExplanationTrace(BaseModel):
    trace_id: str
    summary: str
    top_factors: list[FactorContribution] = Field(default_factory=list)


class TimestampedResponse(BaseModel):
    as_of: datetime = Field(default_factory=lambda: datetime.now(tz=timezone.utc))
