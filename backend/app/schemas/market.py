from pydantic import BaseModel, Field


class QuoteProvenanceResponse(BaseModel):
    provider: str
    provider_symbol: str
    mode: str
    observed_at: str
    fetched_at: str
    age_seconds: int


class StooqQuoteResponse(BaseModel):
    symbol: str
    date: str
    time: str
    open: str
    high: str
    low: str
    close: str
    volume: str
    provenance: QuoteProvenanceResponse


class BatchQuoteItem(BaseModel):
    symbol: str
    quote: StooqQuoteResponse | None


class BatchQuoteResponse(BaseModel):
    items: list[BatchQuoteItem]


class PublicSettingsResponse(BaseModel):
    id: str
    public_settings: dict[str, str | int | float | bool | None] = Field(default_factory=dict)


class MarketFeedStatusResponse(BaseModel):
    providers: list[str]
    background_enabled: bool
    realtime_poll_seconds: float
    ws_enabled: bool
    yahoo_enabled: bool
    cache_size: int
    stale_symbols: list[str]
    running: bool
    yahoo_backoff_seconds: int
    stooq_backoff_seconds: int
