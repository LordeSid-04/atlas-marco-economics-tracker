from __future__ import annotations

from uuid import uuid4

from app.schemas.common import ExplanationTrace, FactorContribution


def make_trace(summary: str, top_factors: list[dict[str, float | str]]) -> ExplanationTrace:
    factors: list[FactorContribution] = []
    for item in top_factors[:5]:
        factors.append(
            FactorContribution(
                factor=str(item.get("factor", "unknown")),
                contribution=float(item.get("contribution", 0.0)),
                weight=float(item.get("weight", 0.0)),
                value=float(item.get("value", 0.0)),
            )
        )

    return ExplanationTrace(
        trace_id=str(uuid4()),
        summary=summary,
        top_factors=factors,
    )
