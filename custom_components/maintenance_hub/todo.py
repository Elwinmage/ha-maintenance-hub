"""Read-only to-do list per location (see doc/SPEC.md §6).

Lists the tasks that are overdue or due soon. Ticking an item records the
maintenance; creating or deleting items is not supported, the list being a
view of the tasks, not a place to store new ones.
"""

from __future__ import annotations

from collections.abc import Callable

from homeassistant.components.todo import (
    TodoItem,
    TodoItemStatus,
    TodoListEntity,
    TodoListEntityFeature,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN
from .runtime import LocationData, MaintenanceHubConfigEntry, compute_view
from .storage import DeviceDef, state_key

PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: MaintenanceHubConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the to-do list of a location."""
    async_add_entities([MaintenanceTodoList(entry.entry_id, entry.runtime_data)])


class MaintenanceTodoList(TodoListEntity):
    """Tasks of a location needing attention."""

    _attr_has_entity_name = True
    _attr_name = None
    _attr_should_poll = False
    _attr_supported_features = TodoListEntityFeature.UPDATE_TODO_ITEM

    def __init__(self, entry_id: str, data: LocationData) -> None:
        self._data = data
        self._attr_unique_id = f"{entry_id}_todo"
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, entry_id)})
        self._unsub: Callable[[], None] | None = None

    def _device_name(self, device: DeviceDef) -> str:
        if device.ha_device_id and self.hass is not None:
            entry = dr.async_get(self.hass).async_get(device.ha_device_id)
            if entry is not None:
                return entry.name_by_user or entry.name or device.name
        return device.name

    @callback
    def _refresh(self) -> None:
        """Rebuild the list: overdue and due-soon tasks, most urgent first."""
        rows: list[tuple[int, TodoItem]] = []
        for device, task in self._data.iter_tasks():
            view = compute_view(self._data.store.get(device.id, task.key))
            if not view.needs_attention or view.due is None:
                continue
            assert view.days_left is not None
            rows.append(
                (
                    view.days_left,
                    TodoItem(
                        uid=state_key(device.id, task.key),
                        summary=f"{self._device_name(device)} · {task.name}",
                        status=TodoItemStatus.NEEDS_ACTION,
                        due=view.due.date(),
                    ),
                )
            )
        rows.sort(key=lambda row: row[0])
        self._attr_todo_items = [item for _, item in rows]

    async def async_update_todo_item(self, item: TodoItem) -> None:
        """Ticking an item records the maintenance as done now."""
        if item.status != TodoItemStatus.COMPLETED or item.uid is None:
            return
        device_id, _, task_key = item.uid.partition("|")
        await self._data.store.async_reset(device_id, task_key)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()

        @callback
        def _changed() -> None:
            self._refresh()
            self.async_write_ha_state()

        self._refresh()
        self._unsub = self._data.store.async_add_global_listener(_changed)

    async def async_will_remove_from_hass(self) -> None:
        if self._unsub is not None:
            self._unsub()
            self._unsub = None
        await super().async_will_remove_from_hass()
