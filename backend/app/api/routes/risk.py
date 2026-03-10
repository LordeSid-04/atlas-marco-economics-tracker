from fastapi import APIRouter

from app.api.deps import AuthRequired, get_risk_engine
from app.schemas.risk import RiskRadarResponse

router = APIRouter(prefix="/api/v1/risk-radar", tags=["risk-radar"], dependencies=[AuthRequired])


@router.get("/live", response_model=RiskRadarResponse)
async def risk_radar_live() -> RiskRadarResponse:
    return await get_risk_engine().get_risk_radar()
