"""Runtime data of a location entry and the computed view of a task."""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass, field
from datetime import datetime

from homeassistant.config_entries import ConfigEntry
from homeassistant.util import dt as dt_util

from .catalog import Catalog
from .const import WARNING_RATIO
from .schedule import cycle_start, days_between, next_due, warning_threshold
from .storage import DeviceDef, LocationStore, TaskDef, TaskState


@dataclass(slots=True)
class LocationData:
    """What a loaded location entry keeps at hand."""

    name: str
    store: LocationStore
    catalog: Catalog
    devices: list[DeviceDef]
    hub_device_id: str
    # entity_id -> task, filled by the sensors when added; used by services.
    entities: dict[str, TaskDef] = field(default_factory=dict)

    def iter_tasks(self) -> Iterator[tuple[DeviceDef, TaskDef]]:
        """Iterate over every (device, task) pair."""
        for device in self.devices:
            for task in device.tasks:
                yield device, task


type MaintenanceHubConfigEntry = ConfigEntry[LocationData]


@dataclass(frozen=True, slots=True)
class TaskView:
    """Computed deadline figures of a task."""

    due: datetime | None
    days_left: int | None
    interval_days: int
    overdue: bool

    @property
    def needs_attention(self) -> bool:
        """True when overdue or inside the warning window (to-do rule)."""
        if self.days_left is None:
            return False
        return self.days_left <= warning_threshold(self.interval_days, WARNING_RATIO)


def compute_view(state: TaskState, now: datetime | None = None) -> TaskView:
    """Compute deadline, remaining days and cycle length of a task."""
    moment = dt_util.as_local(now or dt_util.now())
    last = dt_util.as_local(state.last_reset) if state.last_reset else None
    due = next_due(state.frequency, last, moment)
    if due is None:
        return TaskView(None, None, 0, False)
    due = dt_util.as_local(due)
    start = cycle_start(state.frequency, last, due)
    interval = max(0, days_between(start, due)) if start else 0
    days_left = days_between(moment, due)
    return TaskView(due, days_left, interval, days_left < 0)
