from app.engines.decay import exp_time_decay, logistic_to_score


def test_exp_time_decay_half_life() -> None:
    original = 10.0
    decayed = exp_time_decay(original, age_hours=48, half_life_hours=48)
    assert round(decayed, 4) == 5.0


def test_logistic_to_score_bounds() -> None:
    low = logistic_to_score(-10)
    high = logistic_to_score(10)
    assert 0 <= low <= 100
    assert 0 <= high <= 100
    assert low < high
