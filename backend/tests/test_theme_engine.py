import pytest

from app.engines.theme_engine import ThemeEngine
from app.engines.world_pulse_engine import WorldPulseEngine


@pytest.mark.asyncio
async def test_theme_engine_live_outputs_scores(repo) -> None:
    world_engine = WorldPulseEngine(repo)
    engine = ThemeEngine(repo, world_engine)

    response = await engine.get_live_themes(window_hours=72, limit=8)

    assert response.themes
    assert 12 <= response.window_hours <= 720
    assert all(0 <= item.temperature <= 100 for item in response.themes)
    assert all(item.state in {"hot", "warming", "neutral", "cooling", "cold"} for item in response.themes)


@pytest.mark.asyncio
async def test_theme_engine_sources_and_timeline(repo) -> None:
    world_engine = WorldPulseEngine(repo)
    engine = ThemeEngine(repo, world_engine)

    live = await engine.get_live_themes(window_hours=72, limit=5)
    theme_id = live.themes[0].theme_id

    timeline = await engine.get_theme_timeline(theme_id=theme_id, window_hours=168, max_points=120)
    sources = await engine.get_theme_sources(theme_id=theme_id, window_hours=72, limit=20)

    assert timeline.theme_id == theme_id
    assert timeline.points
    assert sources.theme_id == theme_id
    assert sources.total_articles >= len(sources.articles)
