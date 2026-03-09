from pydantic import BaseModel, Field

from app.schemas.common import ConfidenceTrace, ExplanationTrace, TimestampedResponse


class RiskSummaryCard(BaseModel):
    label: str
    value: int = Field(..., ge=0, le=100)
    change: str
    trend: str
    color: str
    trace_id: str


class RiskCategory(BaseModel):
    id: str
    label: str
    score: int = Field(..., ge=0, le=100)
    color: str
    angle: int = Field(..., ge=0, lt=360)
    description: str
    trace_id: str


class RiskRadarResponse(TimestampedResponse):
    summary_cards: list[RiskSummaryCard]
    categories: list[RiskCategory]
    assessment_summary: str
    confidence: ConfidenceTrace
    explanation: ExplanationTrace
