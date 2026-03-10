from __future__ import annotations

import math


def exp_time_decay(value: float, age_hours: float, half_life_hours: float) -> float:
    if half_life_hours <= 0:
        return value
    if age_hours <= 0:
        return value
    decay_factor = 0.5 ** (age_hours / half_life_hours)
    return value * decay_factor


def logistic_to_score(raw: float, midpoint: float = 0.0, scale: float = 1.0) -> int:
    if scale == 0:
        scale = 1.0
    x = (raw - midpoint) / scale
    prob = 1.0 / (1.0 + math.exp(-x))
    return int(round(max(0.0, min(1.0, prob)) * 100))


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))
