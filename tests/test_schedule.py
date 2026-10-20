"""Recurrence math."""

from __future__ import annotations

from datetime import date, datetime
from zoneinfo import ZoneInfo

import pytest

from custom_components.maintenance_hub.schedule import (
    Frequency,
    add_months,
    add_period,
    anchor_date,
    cycle_start,
    days_between,
    first_anchor_on_or_after,
    next_due,
    parse_anchor,
    validate_frequency,
    warning_threshold,
)

TZ = ZoneInfo("Europe/Paris")


def dt(y: int, m: int, d: int, h: int = 0) -> datetime:
    return datetime(y, m, d, h, tzinfo=TZ)


@pytest.mark.parametrize(
    ("anchor", "expected"),
    [(None, None), ("", None), ("10-15", (10, 15)), ("02-29", (2, 29))],
)
def test_parse_anchor(anchor: str | None, expected: tuple[int, int] | None) -> None:
    assert parse_anchor(anchor) == expected


@pytest.mark.parametrize(
    "anchor", ["1015", "13-01", "00-10", "02-30", "04-31", "ab-cd"]
)
def test_parse_anchor_invalid(anchor: str) -> None:
    with pytest.raises(ValueError):
        parse_anchor(anchor)


def test_validate_frequency() -> None:
    validate_frequency(Frequency("years", 1, "10-15"))
    validate_frequency(Frequency("weeks", 2))
    with pytest.raises(ValueError, match="unit"):
        validate_frequency(Frequency("fortnights", 1))
    with pytest.raises(ValueError, match="at least 1"):
        validate_frequency(Frequency("days", 0))
    with pytest.raises(ValueError, match="years"):
        validate_frequency(Frequency("months", 6, "10-15"))


def test_add_months_clamps_day() -> None:
    assert add_months(dt(2026, 1, 31), 1) == dt(2026, 2, 28)
    assert add_months(dt(2028, 1, 31), 1) == dt(2028, 2, 29)
    assert add_months(dt(2026, 11, 15), 3) == dt(2027, 2, 15)
    assert add_months(dt(2026, 3, 31), -1) == dt(2026, 2, 28)


@pytest.mark.parametrize(
    ("unit", "value", "expected"),
    [
        ("days", 10, dt(2026, 10, 29)),
        ("weeks", 2, dt(2026, 11, 2)),
        ("months", 6, dt(2027, 4, 19)),
        ("years", 2, dt(2028, 10, 19)),
    ],
)
def test_add_period(unit: str, value: int, expected: datetime) -> None:
    assert add_period(dt(2026, 10, 19), unit, value) == expected


def test_add_period_invalid_unit() -> None:
    with pytest.raises(ValueError):
        add_period(dt(2026, 1, 1), "hours", 1)


def test_anchor_date_leap_fallback() -> None:
    assert anchor_date(2027, 2, 29) == date(2027, 2, 28)
    assert anchor_date(2028, 2, 29) == date(2028, 2, 29)


def test_first_anchor_on_or_after() -> None:
    assert first_anchor_on_or_after(10, 15, date(2026, 10, 15)) == date(2026, 10, 15)
    assert first_anchor_on_or_after(10, 15, date(2026, 10, 16)) == date(2027, 10, 15)
    assert first_anchor_on_or_after(4, 1, date(2026, 1, 1)) == date(2026, 4, 1)


def test_next_due_rolling() -> None:
    freq = Frequency("weeks", 2)
    assert next_due(freq, None, dt(2026, 10, 19)) is None
    assert next_due(freq, dt(2026, 10, 1, 9), dt(2026, 10, 19)) == dt(2026, 10, 15, 9)


@pytest.mark.parametrize(
    ("done", "expected"),
    [
        (dt(2026, 10, 20), dt(2027, 10, 15)),  # a bit late
        (dt(2026, 10, 1), dt(2027, 10, 15)),  # a bit early
        (dt(2027, 1, 10), dt(2027, 10, 15)),  # very late
        (dt(2026, 10, 15, 18), dt(2027, 10, 15)),  # on the day
    ],
)
def test_next_due_seasonal_yearly(done: datetime, expected: datetime) -> None:
    assert next_due(Frequency("years", 1, "10-15"), done, dt(2026, 10, 19)) == expected


def test_next_due_seasonal_every_two_years() -> None:
    freq = Frequency("years", 2, "09-01")
    assert next_due(freq, dt(2026, 9, 1), dt(2026, 9, 2)) == dt(2028, 9, 1)
    assert next_due(freq, dt(2026, 12, 1), dt(2026, 12, 2)) == dt(2028, 9, 1)


def test_next_due_seasonal_never_done() -> None:
    freq = Frequency("years", 1, "10-15")
    assert next_due(freq, None, dt(2026, 10, 15, 12)) == dt(2026, 10, 15)
    assert next_due(freq, None, dt(2026, 10, 19)) == dt(2027, 10, 15)


def test_cycle_start() -> None:
    rolling = Frequency("months", 1)
    assert cycle_start(rolling, dt(2026, 9, 1), dt(2026, 10, 1)) == dt(2026, 9, 1)
    assert cycle_start(rolling, None, None) is None
    seasonal = Frequency("years", 1, "10-15")
    assert cycle_start(seasonal, None, dt(2027, 10, 15)) == dt(2026, 10, 15)


def test_days_between_and_threshold() -> None:
    assert days_between(dt(2026, 10, 19, 23), dt(2026, 10, 20, 1)) == 1
    assert days_between(dt(2026, 10, 19), dt(2026, 10, 9)) == -10
    assert warning_threshold(0, 0.2) == 0
    assert warning_threshold(3, 0.2) == 1
    assert warning_threshold(365, 0.2) == 73
