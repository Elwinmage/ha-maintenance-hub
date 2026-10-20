"""Device definitions and persistent task state (see doc/SPEC.md §2 and §9).

Two storages, on purpose:

- ``entry.options`` holds the *definition* of the devices and their task
  list. It changes rarely and a change reloads the entry, which is what we
  want since the entity set changes with it.
- this ``Store`` holds the *state* of each task: last reset, frequency and
  notification flag. It changes on every "done" and every frequency edit,
  and must never trigger a reload.

A task instance is identified by ``(device_id, task_key)``.
"""

from __future__ import annotations

import logging
import secrets
from collections.abc import Callable, Iterable
from dataclasses import dataclass, replace
from datetime import datetime
from typing import Any, Final

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util
from homeassistant.util import slugify

from .catalog import Catalog
from .const import (
    CONF_ANCHOR,
    CONF_DEVICES,
    CONF_HA_DEVICE_ID,
    CONF_ID,
    CONF_KEY,
    CONF_LABEL,
    CONF_NAME,
    CONF_TASKS,
    CONF_TEMPLATE,
    CONF_UNIT,
    CONF_VALUE,
    CUSTOM_PREFIX,
    DEFAULT_ICON,
    DOMAIN,
    UNIT_MONTHS,
)
from .schedule import Frequency, validate_frequency

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION: Final[int] = 1
STORAGE_KEY_TPL: Final[str] = f"{DOMAIN}_{{entry_id}}"

# Default frequency of a custom task typed without one.
CUSTOM_DEFAULT: Final[Frequency] = Frequency(UNIT_MONTHS, 1)


# =============================================================================
# Definitions
# =============================================================================


@dataclass(frozen=True, slots=True)
class TaskDef:
    """A task attached to a device, resolved against the catalog."""

    device_id: str
    key: str
    name: str
    icon: str
    regulatory: bool
    # Frequency copied into the Store the first time the task is seen.
    default: Frequency

    @property
    def is_custom(self) -> bool:
        """True for a user-typed task."""
        return self.key.startswith(CUSTOM_PREFIX)


@dataclass(frozen=True, slots=True)
class DeviceDef:
    """A device of a location: an existing HA device or a manual one."""

    id: str
    name: str
    ha_device_id: str | None
    template: str | None
    tasks: tuple[TaskDef, ...]


def new_device_id() -> str:
    """Return a short random id, stable for the life of the device."""
    return secrets.token_hex(3)


def custom_task_key(label: str, taken: Iterable[str]) -> str:
    """Build a unique key for a user-typed task."""
    base = f"{CUSTOM_PREFIX}{slugify(label) or 'task'}"
    used = set(taken)
    key, index = base, 2
    while key in used:
        key = f"{base}_{index}"
        index += 1
    return key


def _custom_frequency(raw: dict[str, Any]) -> Frequency:
    try:
        freq = Frequency(
            unit=str(raw.get(CONF_UNIT, CUSTOM_DEFAULT.unit)),
            value=int(raw.get(CONF_VALUE, CUSTOM_DEFAULT.value)),
            anchor=raw.get(CONF_ANCHOR) or None,
        )
        validate_frequency(freq)
    except (TypeError, ValueError):
        return CUSTOM_DEFAULT
    return freq


def _resolve_task(
    device_id: str,
    raw: dict[str, Any],
    template: str | None,
    catalog: Catalog,
    language: str,
) -> TaskDef:
    key = str(raw[CONF_KEY])
    if key.startswith(CUSTOM_PREFIX):
        return TaskDef(
            device_id=device_id,
            key=key,
            name=str(raw.get(CONF_LABEL) or key),
            icon=DEFAULT_ICON,
            regulatory=False,
            default=_custom_frequency(raw),
        )
    task = catalog.tasks.get(key)
    if task is None:
        # Catalog entry gone (user catalog edited): keep the task and its
        # history rather than silently dropping them.
        _LOGGER.warning("Task %s is not in the catalog anymore", key)
        return TaskDef(device_id, key, key, DEFAULT_ICON, False, CUSTOM_DEFAULT)
    return TaskDef(
        device_id=device_id,
        key=key,
        name=task.name(language),
        icon=task.icon,
        regulatory=task.regulatory,
        default=catalog.task_frequency(key, template),
    )


def build_devices(
    options: dict[str, Any], catalog: Catalog, language: str
) -> list[DeviceDef]:
    """Turn `entry.options` into device definitions."""
    devices: list[DeviceDef] = []
    for raw in options.get(CONF_DEVICES, []):
        device_id = str(raw[CONF_ID])
        template = raw.get(CONF_TEMPLATE) or None
        seen: set[str] = set()
        tasks: list[TaskDef] = []
        for raw_task in raw.get(CONF_TASKS, []):
            task = _resolve_task(device_id, raw_task, template, catalog, language)
            if task.key in seen:
                continue
            seen.add(task.key)
            tasks.append(task)
        devices.append(
            DeviceDef(
                id=device_id,
                name=str(raw.get(CONF_NAME) or ""),
                ha_device_id=raw.get(CONF_HA_DEVICE_ID) or None,
                template=template,
                tasks=tuple(tasks),
            )
        )
    return devices


# =============================================================================
# State
# =============================================================================


@dataclass(frozen=True, slots=True)
class TaskState:
    """Persistent state of one task instance."""

    frequency: Frequency
    last_reset: datetime | None = None
    notify: bool = True

    def as_dict(self) -> dict[str, Any]:
        """Serialize for the Store."""
        return {
            "last_reset": self.last_reset.isoformat() if self.last_reset else None,
            "unit": self.frequency.unit,
            "value": self.frequency.value,
            "anchor": self.frequency.anchor,
            "notify": self.notify,
        }

    @classmethod
    def from_dict(cls, raw: dict[str, Any], default: Frequency) -> TaskState:
        """Deserialize, falling back on `default` for a broken frequency."""
        try:
            frequency = Frequency(
                unit=str(raw["unit"]),
                value=int(raw["value"]),
                anchor=raw.get("anchor") or None,
            )
            validate_frequency(frequency)
        except (KeyError, TypeError, ValueError):
            frequency = default
        last = raw.get("last_reset")
        parsed = dt_util.parse_datetime(last) if isinstance(last, str) else None
        return cls(
            frequency=frequency,
            last_reset=parsed,
            notify=bool(raw.get("notify", True)),
        )


def state_key(device_id: str, task_key: str) -> str:
    """Key of a task instance in the Store."""
    return f"{device_id}|{task_key}"


class LocationStore:
    """Persistent state of the tasks of one location."""

    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, STORAGE_KEY_TPL.format(entry_id=entry_id)
        )
        self._raw: dict[str, dict[str, Any]] = {}
        self._states: dict[str, TaskState] = {}
        self._listeners: dict[str, list[Callable[[], None]]] = {}
        self._global_listeners: list[Callable[[], None]] = []

    async def async_load(self) -> None:
        """Read the stored states. Parsing happens in `async_sync`."""
        data = await self._store.async_load()
        self._raw = dict(data) if isinstance(data, dict) else {}

    async def async_sync(self, tasks: Iterable[TaskDef]) -> None:
        """Bind the stored states to the current task set.

        New tasks get their default frequency, removed ones are purged.
        """
        states: dict[str, TaskState] = {}
        changed = False
        for task in tasks:
            key = state_key(task.device_id, task.key)
            raw = self._raw.get(key)
            if raw is None:
                states[key] = TaskState(frequency=task.default)
                changed = True
            else:
                states[key] = TaskState.from_dict(raw, task.default)
        if set(self._raw) - set(states):
            changed = True
        self._states = states
        if changed:
            await self._async_save()

    def get(self, device_id: str, task_key: str) -> TaskState:
        """Return the state of a task instance (must be synced)."""
        return self._states[state_key(device_id, task_key)]

    async def async_reset(
        self, device_id: str, task_key: str, when: datetime | None = None
    ) -> None:
        """Mark a task as done, now or at `when`."""
        moment = when or dt_util.now()
        if moment.tzinfo is None:
            moment = moment.replace(tzinfo=dt_util.get_default_time_zone())
        await self._async_update(device_id, task_key, last_reset=moment)

    async def async_set_frequency(
        self, device_id: str, task_key: str, frequency: Frequency
    ) -> None:
        """Change the recurrence of a task (validated)."""
        validate_frequency(frequency)
        await self._async_update(device_id, task_key, frequency=frequency)

    async def async_set_notify(
        self, device_id: str, task_key: str, notify: bool
    ) -> None:
        """Enable or mute the alerts of a task."""
        await self._async_update(device_id, task_key, notify=notify)

    async def async_remove_device(self, device_id: str) -> None:
        """Forget every state of a device."""
        prefix = f"{device_id}|"
        self._states = {
            k: v for k, v in self._states.items() if not k.startswith(prefix)
        }
        await self._async_save()

    async def _async_update(
        self, device_id: str, task_key: str, **changes: Any
    ) -> None:
        key = state_key(device_id, task_key)
        self._states[key] = replace(self._states[key], **changes)
        await self._async_save()
        self.async_notify(key)

    async def _async_save(self) -> None:
        self._raw = {k: v.as_dict() for k, v in self._states.items()}
        await self._store.async_save(self._raw)

    # ---- listeners ---------------------------------------------------------

    @callback
    def async_add_listener(
        self, device_id: str, task_key: str, listener: Callable[[], None]
    ) -> Callable[[], None]:
        """Call `listener` when this task instance changes."""
        bucket = self._listeners.setdefault(state_key(device_id, task_key), [])
        bucket.append(listener)
        return lambda: bucket.remove(listener)

    @callback
    def async_add_global_listener(
        self, listener: Callable[[], None]
    ) -> Callable[[], None]:
        """Call `listener` when any task instance changes."""
        self._global_listeners.append(listener)
        return lambda: self._global_listeners.remove(listener)

    @callback
    def async_notify(self, key: str | None = None) -> None:
        """Notify the listeners of one instance, or of all when key is None."""
        if key is None:
            for bucket in list(self._listeners.values()):
                for listener in list(bucket):
                    listener()
        else:
            for listener in list(self._listeners.get(key, [])):
                listener()
        for listener in list(self._global_listeners):
            listener()
