import pytest

from app.engines.risk_engine import RiskEngine
from app.engines.world_pulse_engine import WorldPulseEngine


@pytest.mark.asyncio
async def test_risk_engine(repo) -> None:
    world = WorldPulseEngine(repo)
    engine = RiskEngine(repo, world)

    result = await engine.get_risk_radar()

    assert len(result.categories) == 6
    assert len(result.summary_cards) == 4
    assert all(0 <= category.score <= 100 for category in result.categories)
