from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import AuthRequired
from app.config import get_settings
from app.data.seed import get_data_repository
from app.schemas.market import (
    BatchQuoteItem,
    BatchQuoteResponse,
    MarketFeedStatusResponse,
    PublicSettingsResponse,
    StooqQuoteResponse,
)

router = APIRouter(tags=["market"])


@router.get("/api/stooq", response_model=StooqQuoteResponse)
async def stooq_quote(symbol: str = Query(..., min_length=1)) -> StooqQuoteResponse:
    repo = get_data_repository()
    quotes = await repo.fetch_quotes([symbol])
    quote = quotes.get(symbol.strip().lower())
    if quote is None:
        raise HTTPException(status_code=404, detail=f"symbol not available: {symbol}")
    return StooqQuoteResponse(**quote)


@router.get("/api/stooq/batch", response_model=BatchQuoteResponse)
async def stooq_batch(symbols: str = Query(..., description="Comma-separated symbol list")) -> BatchQuoteResponse:
    symbol_list = [s.strip().lower() for s in symbols.split(",") if s.strip()]
    quotes = await get_data_repository().fetch_quotes(symbol_list)
    items = [
        BatchQuoteItem(symbol=symbol, quote=StooqQuoteResponse(**quote) if quote else None)
        for symbol, quote in quotes.items()
    ]
    return BatchQuoteResponse(items=items)


@router.get("/api/v1/market/quotes", response_model=BatchQuoteResponse, dependencies=[AuthRequired])
async def market_quotes(symbols: str = Query(..., description="Comma-separated symbol list")) -> BatchQuoteResponse:
    symbol_list = [s.strip().lower() for s in symbols.split(",") if s.strip()]
    quotes = await get_data_repository().fetch_quotes(symbol_list)

    items = [
        BatchQuoteItem(symbol=symbol, quote=StooqQuoteResponse(**quote) if quote else None)
        for symbol, quote in quotes.items()
    ]
    return BatchQuoteResponse(items=items)


@router.get(
    "/api/v1/market/feed-status",
    response_model=MarketFeedStatusResponse,
    dependencies=[AuthRequired],
)
def market_feed_status() -> MarketFeedStatusResponse:
    status = get_data_repository().market_feed_status()
    return MarketFeedStatusResponse(**status)


@router.get(
    "/api/apps/public/prod/public-settings/by-id/{app_id}",
    response_model=PublicSettingsResponse,
)
async def public_settings(app_id: str) -> PublicSettingsResponse:
    settings = get_settings()
    return PublicSettingsResponse(
        id=app_id,
        public_settings={
            "auth_required": settings.auth_required,
            "backend": "atlas-fastapi",
        },
    )
