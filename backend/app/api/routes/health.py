from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "atlas-backend",
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
    }
