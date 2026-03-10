import pytest

from app.engines.analogue_engine import AnalogueEngine
from app.engines.world_pulse_engine import WorldPulseEngine


@pytest.mark.asyncio
async def test_analogue_engine(repo) -> None:
    world = WorldPulseEngine(repo)
    engine = AnalogueEngine(repo, world)

    result = await engine.get_analogues()

    assert result.regimes
    assert all(0 <= regime.similarity <= 100 for regime in result.regimes)
    assert result.connections
