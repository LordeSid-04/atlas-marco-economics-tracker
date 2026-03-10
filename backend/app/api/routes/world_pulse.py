from fastapi import APIRouter, HTTPException, Query

from app.api.deps import AuthRequired, get_world_pulse_engine
from app.schemas.world_pulse import CountryRelationResponse, DataProof, WorldPulseDebugResponse, WorldPulseResponse

router = APIRouter(prefix="/api/v1/world-pulse", tags=["world-pulse"], dependencies=[AuthRequired])


@router.get("/live", response_model=WorldPulseResponse)
async def world_pulse_live() -> WorldPulseResponse:
    engine = get_world_pulse_engine()
    return await engine.build_world_pulse()


@router.get("/debug/factors", response_model=WorldPulseDebugResponse)
async def world_pulse_debug_factors() -> WorldPulseDebugResponse:
    engine = get_world_pulse_engine()
    state = await engine.compute_factor_state()
    return WorldPulseDebugResponse(
        features={
            "factors": state.factors,
            "coverage": state.coverage,
            "freshness": state.freshness,
            "stability": state.stability,
        }
    )


@router.get("/relation", response_model=CountryRelationResponse)
async def world_pulse_relation(
    from_country: str = Query(..., min_length=2),
    to_country: str = Query(..., min_length=2),
) -> CountryRelationResponse:
    engine = get_world_pulse_engine()
    try:
        return await engine.build_country_relation(from_country, to_country)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/country-proof", response_model=DataProof)
async def world_pulse_country_proof(country_id: str = Query(..., min_length=2)) -> DataProof:
    engine = get_world_pulse_engine()
    try:
        return await engine.build_country_data_proof(country_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
