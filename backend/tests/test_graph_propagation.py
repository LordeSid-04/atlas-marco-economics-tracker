from app.engines.graph_propagation import propagate


def test_propagation_returns_intensities_and_flows() -> None:
    edges = [
        {"from": "a", "to": "b", "base_weight": 0.8, "driver_multipliers": {"Interest Rates": 1.2}},
        {"from": "b", "to": "c", "base_weight": 0.7, "driver_multipliers": {"Interest Rates": 1.0}},
    ]

    intensities, flows, steps = propagate(
        edges=edges,
        origin="a",
        severity=80,
        driver="Interest Rates",
        max_steps=3,
    )

    assert intensities["a"] > 0
    assert intensities["b"] > 0
    assert flows
    assert steps["a"] == 0
    assert steps["b"] >= 1
