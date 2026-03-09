import pytest

from app.engines.scenario_engine import ScenarioEngine
from app.engines.world_pulse_engine import WorldPulseEngine
from app.schemas.scenario import ScenarioRunRequest


@pytest.mark.asyncio
async def test_scenario_engine_run(repo) -> None:
    world = WorldPulseEngine(repo)
    engine = ScenarioEngine(repo, world)

    payload = ScenarioRunRequest(
        driver="Interest Rates",
        event="Rate Hike +100bp",
        region="United States",
        severity=70,
        horizon="12 Months",
    )

    result = await engine.run(payload)

    assert result.impacts
    assert result.graph.nodes
    assert result.graph.edges
    assert result.execution_trace
    assert result.config.region == "United States"
