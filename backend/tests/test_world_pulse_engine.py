import pytest

from app.engines.world_pulse_engine import WorldPulseEngine, _relation_quality_label


@pytest.mark.asyncio
async def test_world_pulse_engine_outputs_hotspots(repo) -> None:
    engine = WorldPulseEngine(repo)
    response = await engine.build_world_pulse()

    assert response.hotspots
    assert response.arcs
    assert 0 <= response.confidence.score <= 100
    assert response.header.active_regions == len(response.hotspots)


@pytest.mark.asyncio
async def test_country_relation_strength_is_weighted_and_deterministic(repo) -> None:
    engine = WorldPulseEngine(repo)
    relation = await engine.build_country_relation("ua", "ru")

    expected_strength = round(
        relation.trade_intensity * 0.34
        + relation.financial_linkage * 0.28
        + (100 - relation.policy_divergence) * 0.2
        + (100 - relation.geopolitical_risk) * 0.18
    )

    assert relation.relation_strength == expected_strength
    assert relation.relation_quality_label == _relation_quality_label(relation.relation_quality_score)
    assert relation.arc.color in {"#22c55e", "#38bdf8", "#f59e0b"}


def test_relation_quality_bands() -> None:
    assert _relation_quality_label(85) == "good"
    assert _relation_quality_label(55) == "mixed"
    assert _relation_quality_label(22) == "bad"
