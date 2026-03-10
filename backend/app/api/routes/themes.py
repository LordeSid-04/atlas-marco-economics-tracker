from fastapi import APIRouter, HTTPException, Query

from app.api.deps import AuthRequired, get_theme_engine
from app.schemas.themes import ThemeLiveResponse, ThemeSourcesResponse, ThemeTimelineResponse

router = APIRouter(prefix="/api/v1/themes", tags=["themes"], dependencies=[AuthRequired])


@router.get("/live", response_model=ThemeLiveResponse)
async def themes_live(
    window_hours: int = Query(default=72, ge=12, le=720),
    limit: int = Query(default=8, ge=1, le=30),
) -> ThemeLiveResponse:
    engine = get_theme_engine()
    return await engine.get_live_themes(window_hours=window_hours, limit=limit)


@router.get("/{theme_id}/timeline", response_model=ThemeTimelineResponse)
async def theme_timeline(
    theme_id: str,
    window_hours: int = Query(default=168, ge=12, le=2160),
    max_points: int = Query(default=120, ge=10, le=500),
) -> ThemeTimelineResponse:
    engine = get_theme_engine()
    try:
        return await engine.get_theme_timeline(
            theme_id=theme_id,
            window_hours=window_hours,
            max_points=max_points,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{theme_id}/sources", response_model=ThemeSourcesResponse)
async def theme_sources(
    theme_id: str,
    window_hours: int = Query(default=72, ge=12, le=720),
    limit: int = Query(default=25, ge=1, le=100),
) -> ThemeSourcesResponse:
    engine = get_theme_engine()
    try:
        return await engine.get_theme_sources(theme_id=theme_id, window_hours=window_hours, limit=limit)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
