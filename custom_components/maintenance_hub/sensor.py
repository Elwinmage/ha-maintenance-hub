"""One timestamp sensor per maintenance task (see doc/SPEC.md §4).

The state is the deadline, so automations can use a plain `time` trigger
(`at: sensor.xxx`) to fire on it. Every other figure the card needs is an
attribute; frequency and notification edits go through the services.
"""

from __future__ import annotations

from collections.abc import Callable

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import (
    ATTR_ANCHOR,
    ATTR_DAYS_LEFT,
    ATTR_FREQUENCY_UNIT,
    ATTR_FREQUENCY_VALUE,
    ATTR_INTERVAL_DAYS,
    ATTR_LAST_RESET,
    ATTR_LOCATION_ID,
    ATTR_LOCATION_NAME,
    ATTR_NOTIFY,
    ATTR_OVERDUE,
    ATTR_REGULATORY,
    ATTR_TASK_KEY,
    DOMAIN,
    ROLE_ATTR,
    ROLE_PREFIX,
)
from .runtime import LocationData, MaintenanceHubConfigEntry, compute_view
from .storage import DeviceDef, TaskDef

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: MaintenanceHubConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the task sensors of a location."""
    data = entry.runtime_data
    registry = dr.async_get(hass)
    entities: list[MaintenanceTaskSensor] = []
    for device in data.devices:
        linked = (
            registry.async_get(device.ha_device_id) if device.ha_device_id else None
        )
        entities.extend(
            MaintenanceTaskSensor(entry.entry_id, data, device, task, linked)
            for task in device.tasks
        )
    async_add_entities(entities)


class MaintenanceTaskSensor(SensorEntity):
    """Deadline of one maintenance task."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        entry_id: str,
        data: LocationData,
        device: DeviceDef,
        task: TaskDef,
        linked: dr.AnyDeviceEntry | None,
    ) -> None:
        self._entry_id = entry_id
        self._data = data
        self._device = device
        self._task = task
        self._attr_unique_id = f"{entry_id}_{device.id}_{task.key}"
        self._attr_name = task.name
        self._attr_icon = task.icon
        self._unsub: Callable[[], None] | None = None

        if linked is not None:
            # Attach to the existing HA device without claiming it: the
            # device keeps belonging to its own integration only.
            self.device_entry = linked
        else:
            # Manual device, or a linked device that disappeared: fall back
            # on a device of our own carrying the last known name.
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, f"{entry_id}_{device.id}")},
                name=device.name or task.name,
                manufacturer="Maintenance Hub",
                model=device.template,
                via_device_id=data.hub_device_id,
            )

    # ---- state -------------------------------------------------------------

    @callback
    def _refresh(self) -> None:
        """Recompute the deadline and the maintenance contract attributes.

        The state is the deadline; None (unknown) for a rolling task never
        done. The attributes are what the card and the blueprints read.
        """
        state = self._data.store.get(self._task.device_id, self._task.key)
        view = compute_view(state)
        self._attr_native_value = view.due
        self._attr_extra_state_attributes = {
            ROLE_ATTR: f"{ROLE_PREFIX}{self._task.key}",
            ATTR_TASK_KEY: self._task.key,
            ATTR_FREQUENCY_UNIT: state.frequency.unit,
            ATTR_FREQUENCY_VALUE: state.frequency.value,
            ATTR_ANCHOR: state.frequency.anchor,
            ATTR_INTERVAL_DAYS: view.interval_days,
            ATTR_DAYS_LEFT: view.days_left,
            ATTR_OVERDUE: view.overdue,
            ATTR_LAST_RESET: state.last_reset.isoformat() if state.last_reset else None,
            ATTR_NOTIFY: state.notify,
            ATTR_REGULATORY: self._task.regulatory,
            ATTR_LOCATION_ID: self._entry_id,
            ATTR_LOCATION_NAME: self._data.name,
        }

    # ---- lifecycle ---------------------------------------------------------

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self._data.entities[self.entity_id] = self._task

        @callback
        def _changed() -> None:
            self._refresh()
            self.async_write_ha_state()

        self._refresh()
        self._unsub = self._data.store.async_add_listener(
            self._task.device_id, self._task.key, _changed
        )

    async def async_will_remove_from_hass(self) -> None:
        if self._unsub is not None:
            self._unsub()
            self._unsub = None
        self._data.entities.pop(self.entity_id, None)
        await super().async_will_remove_from_hass()
