from fastapi import APIRouter

from app.api.deps import AuthRequired

router = APIRouter(prefix="/api/v1/metadata", tags=["metadata"], dependencies=[AuthRequired])


@router.get("/algorithms")
def algorithms() -> dict[str, list[str]]:
    return {
        "core_methods": [
            "weighted time-decay scoring",
            "directed weighted graph propagation",
            "weighted cosine similarity retrieval",
            "weighted risk aggregation",
            "deterministic keyword-weight theme scoring",
            "hot/cool lifecycle state detection with hysteresis",
            "deterministic template explanations",
        ]
    }
