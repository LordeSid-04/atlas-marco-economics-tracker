from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ConfidenceTrace, ExplanationTrace, TimestampedResponse


class ThemeLiveItem(BaseModel):
    theme_id: str
    label: str
    state: str
    temperature: int = Field(..., ge=0, le=100)
    mention_count: int = Field(..., ge=0)
    source_diversity: int = Field(..., ge=0)
    cross_region_spread: int = Field(..., ge=0)
    market_reaction_score: int = Field(..., ge=0, le=100)
    momentum: float
    top_regions: list[str]
    top_assets: list[str]
    summary: str
    trace_id: str


class ThemeSourceArticle(BaseModel):
    article_id: str
    title: str
    url: str
    source: str
    published_at: datetime
    region_tags: list[str]
    asset_tags: list[str]
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    matched_keywords: list[str]
    excerpt: str


class ThemeLiveResponse(TimestampedResponse):
    window_hours: int = Field(..., ge=12, le=720)
    themes: list[ThemeLiveItem]
    confidence: ConfidenceTrace
    explanation: ExplanationTrace


class ThemeTimelinePoint(BaseModel):
    as_of: datetime
    temperature: int = Field(..., ge=0, le=100)
    mention_count: int = Field(..., ge=0)
    state: str
    momentum: float


class ThemeTimelineResponse(TimestampedResponse):
    theme_id: str
    label: str
    window_hours: int = Field(..., ge=12, le=2160)
    points: list[ThemeTimelinePoint]
    explanation: ExplanationTrace


class ThemeSourcesResponse(TimestampedResponse):
    theme_id: str
    label: str
    window_hours: int = Field(..., ge=12, le=720)
    total_articles: int = Field(..., ge=0)
    articles: list[ThemeSourceArticle]
    explanation: ExplanationTrace
