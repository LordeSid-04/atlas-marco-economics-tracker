from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import networkx as nx

from app.engines.decay import clamp


@dataclass(slots=True)
class EdgeFlow:
    from_node: str
    to_node: str
    weight: float
    flow: float
    activation_step: int


def build_graph(edges: list[dict[str, Any]]) -> nx.DiGraph:
    graph = nx.DiGraph()
    for edge in edges:
        graph.add_edge(edge["from"], edge["to"], **edge)
    return graph


def propagate(
    edges: list[dict[str, Any]],
    origin: str,
    severity: int,
    driver: str,
    *,
    max_steps: int = 4,
    step_decay: float = 0.82,
    flow_threshold: float = 0.02,
) -> tuple[dict[str, float], list[EdgeFlow], dict[str, int]]:
    graph = build_graph(edges)

    intensities: dict[str, float] = {origin: clamp(severity / 100.0, 0.0, 1.0)}
    activation_steps: dict[str, int] = {origin: 0}
    edge_flows: list[EdgeFlow] = []

    frontier = {origin}
    for step in range(1, max_steps + 1):
        next_frontier: set[str] = set()

        for node in frontier:
            source_intensity = intensities.get(node, 0.0)
            if source_intensity <= 0:
                continue

            for _, target, data in graph.out_edges(node, data=True):
                base_weight = float(data.get("base_weight", data.get("weight", 0.0)))
                driver_mult = float(data.get("driver_multipliers", {}).get(driver, 1.0))
                step_factor = step_decay ** (step - 1)
                flow = source_intensity * base_weight * driver_mult * step_factor

                if flow < flow_threshold:
                    continue

                flow = clamp(flow, 0.0, 1.0)
                previous = intensities.get(target, 0.0)
                candidate = clamp(previous + flow, 0.0, 1.0)

                if candidate > previous:
                    intensities[target] = candidate
                    if target not in activation_steps:
                        activation_steps[target] = step
                    next_frontier.add(target)

                edge_flows.append(
                    EdgeFlow(
                        from_node=node,
                        to_node=target,
                        weight=base_weight,
                        flow=flow,
                        activation_step=step,
                    )
                )

        if not next_frontier:
            break
        frontier = next_frontier

    return intensities, edge_flows, activation_steps
