import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.api.deps import AuthRequired, get_scenario_engine
from app.schemas.scenario import ScenarioOptionsResponse, ScenarioRunRequest, ScenarioRunResponse

router = APIRouter(prefix="/api/v1/scenario", tags=["scenario"], dependencies=[AuthRequired])


@router.get("/options", response_model=ScenarioOptionsResponse)
def scenario_options() -> ScenarioOptionsResponse:
    return get_scenario_engine().options()


@router.post("/run", response_model=ScenarioRunResponse)
async def run_scenario(payload: ScenarioRunRequest) -> ScenarioRunResponse:
    engine = get_scenario_engine()
    try:
        return await engine.run(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/run/stream")
async def run_scenario_stream(payload: ScenarioRunRequest) -> StreamingResponse:
    engine = get_scenario_engine()

    async def _stream():
        try:
            async for event in engine.run_stream(payload):
                yield json.dumps(event, separators=(",", ":")) + "\n"
        except ValueError as exc:
            error_event = {"type": "error", "error": str(exc)}
            yield json.dumps(error_event, separators=(",", ":")) + "\n"

    return StreamingResponse(_stream(), media_type="application/x-ndjson")
