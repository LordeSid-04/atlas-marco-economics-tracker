from fastapi import APIRouter, Query

from app.api.deps import AuthRequired, get_analogue_engine
from app.schemas.historical import HistoricalAnaloguesResponse

router = APIRouter(prefix="/api/v1/historical", tags=["historical"], dependencies=[AuthRequired])


@router.get("/analogues", response_model=HistoricalAnaloguesResponse)
async def historical_analogues(k: int = Query(default=0, ge=0, le=20)) -> HistoricalAnaloguesResponse:
    engine = get_analogue_engine()
    return await engine.get_analogues(k if k > 0 else None)
