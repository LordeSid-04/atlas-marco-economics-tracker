from __future__ import annotations

from app.schemas.common import ConfidenceComponents, ConfidenceTrace


def compute_confidence(freshness: float, coverage: float, stability: float) -> ConfidenceTrace:
    freshness = max(0.0, min(1.0, freshness))
    coverage = max(0.0, min(1.0, coverage))
    stability = max(0.0, min(1.0, stability))

    score = round((0.35 * freshness + 0.4 * coverage + 0.25 * stability) * 100)
    return ConfidenceTrace(
        score=score,
        components=ConfidenceComponents(
            freshness=freshness,
            coverage=coverage,
            stability=stability,
        ),
    )
