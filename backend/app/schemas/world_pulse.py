from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import ConfidenceTrace, ExplanationTrace, TimestampedResponse


class RegionAssets(BaseModel):
    equities: str
    rates: str
    fx: str
    commodities: str
    credit: str


class CountryProfile(BaseModel):
    gdp_trillion_usd: float
    population_millions: int
    trade_openness: int = Field(..., ge=0, le=400)
    policy_rate: float
    inflation: float
    currency: str
    blocs: list[str]
    key_sectors: list[str]
    risk_flags: list[str]


class Hotspot(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    narrative: str
    heat: int = Field(..., ge=0, le=100)
    confidence: int = Field(..., ge=0, le=100)
    color: str
    regime: str
    narratives: list[str]
    risks: list[str]
    assets: RegionAssets
    cluster: str
    importance: int = Field(..., ge=0, le=100)
    profile: CountryProfile
    trace_id: str


class TransmissionArc(BaseModel):
    from_region: str = Field(alias="from")
    to_region: str = Field(alias="to")
    label: str
    color: str
    intensity: float = Field(..., ge=0.0, le=1.0)
    message: str | None = None
    trace_id: str

    model_config = {"populate_by_name": True}


class WorldPulseHeader(BaseModel):
    active_regions: int
    transmission_arcs: int


class DataSourceReference(BaseModel):
    name: str
    url: str
    coverage: str


class DataProof(BaseModel):
    context: str
    methodology: str
    deterministic: bool
    market_inputs_used: int
    provider_mix: dict[str, int]
    latest_market_observation: str
    sources: list[DataSourceReference]


class WorldPulseResponse(TimestampedResponse):
    header: WorldPulseHeader
    hotspots: list[Hotspot]
    arcs: list[TransmissionArc]
    confidence: ConfidenceTrace
    explanation: ExplanationTrace
    data_proof: DataProof


class CountryRelationResponse(TimestampedResponse):
    from_country: str
    to_country: str
    relation_strength: int = Field(..., ge=0, le=100)
    relation_quality_score: int = Field(..., ge=0, le=100)
    relation_quality_label: str
    trade_intensity: int = Field(..., ge=0, le=100)
    financial_linkage: int = Field(..., ge=0, le=100)
    policy_divergence: int = Field(..., ge=0, le=100)
    geopolitical_risk: int = Field(..., ge=0, le=100)
    channel_scores: dict[str, int]
    dominant_channel: str
    estimated_spillover_bps: float
    narrative: str
    arc: TransmissionArc
    explanation: ExplanationTrace
    data_proof: DataProof


class WorldPulseDebugResponse(BaseModel):
    features: dict[str, Any]
