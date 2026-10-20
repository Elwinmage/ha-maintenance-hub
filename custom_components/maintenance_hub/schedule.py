"""Recurrence math (see doc/SPEC.md §3).

Pure functions, no Home Assistant import: everything here is unit tested in
isolation. Periods are calendar based — adding a month to January 31st lands
on the last day of February — never multiples of days, so a yearly task
stays on the same date across leap years.
"""

from __future__ import annotations

import calendar
import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Final

from .const import UNIT_DAYS, UNIT_MONTHS, UNIT_WEEKS, UNIT_YEARS, VALID_UNITS

_ANCHOR_RE: Final = re.compile(r"^(\d{2})-(\d{2})$")


@dataclass(frozen=True, slots=True)
class Frequency:
    """How often a task comes back."""

    unit: str
    value: int
    # "MM-DD" for a seasonal task, None for a rolling one.
    anchor: str | None = None


def parse_anchor(anchor: str | None) -> tuple[int, int] | None:
    """Return (month, day) of a "MM-DD" anchor, None when absent.

    Raises ValueError on a malformed anchor. February 29th is accepted: it
    falls back to the 28th on non-leap years (see `anchor_date`).
    """
    if anchor is None or anchor == "":
        return None
    match = _ANCHOR_RE.match(anchor)
    if match is None:
        raise ValueError(f"Invalid anchor {anchor!r}, expected MM-DD")
    month, day = int(match.group(1)), int(match.group(2))
    if not 1 <= month <= 12:
        raise ValueError(f"Invalid anchor month in {anchor!r}")
    # 2000 is a leap year, so Feb 29 passes here.
    if not 1 <= day <= calendar.monthrange(2000, month)[1]:
        raise ValueError(f"Invalid anchor day in {anchor!r}")
    return month, day


def validate_frequency(freq: Frequency) -> None:
    """Raise ValueError when a frequency cannot be scheduled."""
    if freq.unit not in VALID_UNITS:
        raise ValueError(f"Invalid unit {freq.unit!r}")
    if freq.value < 1:
        raise ValueError("Frequency value must be at least 1")
    if parse_anchor(freq.anchor) is not None and freq.unit != UNIT_YEARS:
        raise ValueError("An anchor requires the 'years' unit")


def add_months(moment: datetime, months: int) -> datetime:
    """Add calendar months, clamping the day to the target month length."""
    index = moment.year * 12 + (moment.month - 1) + months
    year, month = divmod(index, 12)
    month += 1
    day = min(moment.day, calendar.monthrange(year, month)[1])
    return moment.replace(year=year, month=month, day=day)


def add_period(moment: datetime, unit: str, value: int) -> datetime:
    """Add `value` units to a datetime, calendar aware."""
    if unit == UNIT_DAYS:
        return moment + timedelta(days=value)
    if unit == UNIT_WEEKS:
        return moment + timedelta(weeks=value)
    if unit == UNIT_MONTHS:
        return add_months(moment, value)
    if unit == UNIT_YEARS:
        return add_months(moment, value * 12)
    raise ValueError(f"Invalid unit {unit!r}")


def anchor_date(year: int, month: int, day: int) -> date:
    """Return the anchor date of a year, Feb 29 falling back to the 28th."""
    return date(year, month, min(day, calendar.monthrange(year, month)[1]))


def first_anchor_on_or_after(month: int, day: int, start: date) -> date:
    """Return the first occurrence of an anchor on or after `start`."""
    candidate = anchor_date(start.year, month, day)
    if candidate < start:
        candidate = anchor_date(start.year + 1, month, day)
    return candidate


def _at_midnight(day: date, like: datetime) -> datetime:
    """Midnight of `day` in the timezone of `like`."""
    return datetime(day.year, day.month, day.day, tzinfo=like.tzinfo)


def next_due(
    freq: Frequency, last_reset: datetime | None, now: datetime
) -> datetime | None:
    """Return the deadline of a task.

    Rolling: last reset + period, None when never done.
    Seasonal: first anchor on or after last reset + (period - 6 months), so
    a task done a bit early or a bit late still lands on the next season;
    when never done, the next anchor from today (included).
    """
    anchor = parse_anchor(freq.anchor)
    if anchor is None:
        if last_reset is None:
            return None
        return add_period(last_reset, freq.unit, freq.value)

    month, day = anchor
    if last_reset is None:
        return _at_midnight(first_anchor_on_or_after(month, day, now.date()), now)
    threshold = add_months(last_reset, freq.value * 12 - 6)
    return _at_midnight(
        first_anchor_on_or_after(month, day, threshold.date()), last_reset
    )


def cycle_start(
    freq: Frequency, last_reset: datetime | None, due: datetime | None
) -> datetime | None:
    """Return the start of the current cycle, used for the progress ratio."""
    if due is None:
        return None
    if parse_anchor(freq.anchor) is None:
        return last_reset
    return add_period(due, UNIT_YEARS, -freq.value)


def days_between(start: datetime, end: datetime) -> int:
    """Whole calendar days from `start` to `end` (dates only)."""
    return (end.date() - start.date()).days


def warning_threshold(interval_days: int, ratio: float) -> int:
    """Days below which a task is due soon; same rule as the card."""
    if interval_days <= 0:
        return 0
    return max(1, round(interval_days * ratio))
