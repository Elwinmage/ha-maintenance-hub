"""The Maintenance Hub integration.

Tracks recurring maintenance tasks of a home — pool, heating, air
conditioning, appliances, garden — organised as location -> device -> task.
One config entry per location; each task is a timestamp sensor whose state
is the deadline (see doc/SPEC.md).

The integration also serves its own Lovelace card, so a single HACS install
brings both.
"""

from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path
from typing import TYPE_CHECKING, Any

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import (
    StaticPathConfig,
)
from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_time_change
from homeassistant.helpers.typing import ConfigType
from homeassistant.loader import async_get_integration

from .catalog import load_catalog
from .const import (
    ATTR_ANCHOR,
    ATTR_LAST_RESET,
    ATTR_NOTIFY,
    CARD_FILENAME,
    CONF_DEVICES,
    CONF_ID,
    CONF_NAME,
    CONF_UNIT,
    CONF_VALUE,
    DOMAIN,
    FRONTEND_URL_BASE,
    MAX_VALUE,
    MIN_VALUE,
    PLATFORMS,
    SERVICE_RESET,
    SERVICE_SET_FREQUENCY,
    SERVICE_SET_NOTIFY,
    VALID_UNITS,
)
from .runtime import LocationData, MaintenanceHubConfigEntry
from .schedule import Frequency, parse_anchor
from .storage import LocationStore, TaskDef, build_devices

# Home Assistant validates with probatio, voluptuous being only an alias of it
# at runtime (2026.9), and types its flow helpers with probatio schemas since
# 2026.10. Older versions only have voluptuous.
if TYPE_CHECKING:
    import probatio as vol
else:
    try:
        import probatio as vol
    except ImportError:  # pragma: no cover - depends on the installed HA version
        import voluptuous as vol

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

FRONTEND_DIR = Path(__file__).parent / "frontend"


def _anchor(value: Any) -> str | None:
    """Validate an optional "MM-DD" anchor; empty means no anchor."""
    if value in (None, ""):
        return None
    text = str(value)
    try:
        parse_anchor(text)
    except ValueError as err:
        raise vol.Invalid(str(err)) from err
    return text


SERVICE_RESET_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
        vol.Optional(ATTR_LAST_RESET): cv.datetime,
    }
)

SERVICE_SET_FREQUENCY_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
        vol.Required(CONF_UNIT): vol.In(VALID_UNITS),
        vol.Required(CONF_VALUE): vol.All(
            vol.Coerce(int), vol.Range(min=MIN_VALUE, max=MAX_VALUE)
        ),
        vol.Optional(ATTR_ANCHOR): _anchor,
    }
)

SERVICE_SET_NOTIFY_SCHEMA = vol.Schema(
    {
        vol.Required("entity_id"): cv.entity_ids,
        vol.Required(ATTR_NOTIFY): cv.boolean,
    }
)


# =============================================================================
# Setup
# =============================================================================


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Serve the card and register the services, once for all locations."""
    await _async_register_frontend(hass)
    _async_register_services(hass)
    return True


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the bundled card and load it on every dashboard.

    The version query string busts the browser cache after an update.
    """
    if not (FRONTEND_DIR / CARD_FILENAME).is_file():  # pragma: no cover
        _LOGGER.warning("Card bundle missing, the dashboard card is unavailable")
        return
    integration = await async_get_integration(hass, DOMAIN)
    await hass.http.async_register_static_paths(
        [StaticPathConfig(FRONTEND_URL_BASE, str(FRONTEND_DIR), cache_headers=False)]
    )
    add_extra_js_url(
        hass, f"{FRONTEND_URL_BASE}/{CARD_FILENAME}?v={integration.version}"
    )


async def async_setup_entry(
    hass: HomeAssistant, entry: MaintenanceHubConfigEntry
) -> bool:
    """Set up one location."""
    catalog = await hass.async_add_executor_job(load_catalog, hass.config.config_dir)
    devices = build_devices(dict(entry.options), catalog, hass.config.language)

    store = LocationStore(hass, entry.entry_id)
    await store.async_load()
    await store.async_sync(task for device in devices for task in device.tasks)

    name: str = entry.data[CONF_NAME]
    hub = dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        name=name,
        manufacturer="Maintenance Hub",
        model="Location",
        entry_type=dr.DeviceEntryType.SERVICE,
    )
    entry.runtime_data = LocationData(
        name=name,
        store=store,
        catalog=catalog,
        devices=devices,
        hub_device_id=hub.id,
    )
    _async_remove_stale_devices(hass, entry)
    _async_remove_stale_entities(hass, entry)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    # days_left and overdue move with the calendar, not only with resets.
    @callback
    def _midnight(_now: datetime) -> None:
        store.async_notify()

    entry.async_on_unload(
        async_track_time_change(hass, _midnight, hour=0, minute=0, second=5)
    )
    return True


async def async_unload_entry(
    hass: HomeAssistant, entry: MaintenanceHubConfigEntry
) -> bool:
    """Unload a location."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def _async_update_listener(
    hass: HomeAssistant, entry: MaintenanceHubConfigEntry
) -> None:
    """Reload when the device list changed: the entity set changes with it."""
    await hass.config_entries.async_reload(entry.entry_id)


@callback
def _async_remove_stale_devices(
    hass: HomeAssistant, entry: MaintenanceHubConfigEntry
) -> None:
    """Remove the manual devices that are no longer defined.

    Only devices created by this entry are listed here: HA devices the tasks
    are linked to belong to their own integration and are never touched.
    """
    registry = dr.async_get(hass)
    wanted = {(DOMAIN, entry.entry_id)} | {
        (DOMAIN, f"{entry.entry_id}_{device.id}")
        for device in entry.runtime_data.devices
    }
    for device in dr.async_entries_for_config_entry(registry, entry.entry_id):
        if not device.identifiers & wanted:
            registry.async_remove_device(device.id)


@callback
def _async_remove_stale_entities(
    hass: HomeAssistant, entry: MaintenanceHubConfigEntry
) -> None:
    """Drop registry entries of tasks removed from the options.

    Without this, a task unticked in the options flow would linger as an
    unavailable entity forever.
    """
    registry = er.async_get(hass)
    wanted = {f"{entry.entry_id}_todo"} | {
        f"{entry.entry_id}_{device.id}_{task.key}"
        for device, task in entry.runtime_data.iter_tasks()
    }
    for record in er.async_entries_for_config_entry(registry, entry.entry_id):
        if record.unique_id not in wanted:
            registry.async_remove(record.entity_id)


async def async_remove_config_entry_device(
    hass: HomeAssistant, entry: MaintenanceHubConfigEntry, device: dr.DeviceEntry
) -> bool:
    """Allow deleting a manual device straight from its device page.

    The location hub itself is not removable: it is the entry.
    """
    prefix = f"{entry.entry_id}_"
    device_id = next(
        (
            value[len(prefix) :]
            for domain, value in device.identifiers
            if domain == DOMAIN and value.startswith(prefix)
        ),
        None,
    )
    if device_id is None:
        return False
    remaining = [
        item
        for item in entry.options.get(CONF_DEVICES, [])
        if item[CONF_ID] != device_id
    ]
    await entry.runtime_data.store.async_remove_device(device_id)
    hass.config_entries.async_update_entry(
        entry, options={**entry.options, CONF_DEVICES: remaining}
    )
    return True


# =============================================================================
# Services
# =============================================================================


def _resolve(
    hass: HomeAssistant, entity_id: str
) -> tuple[LocationStore, TaskDef] | None:
    """Map an entity_id back to its store and task."""
    record = er.async_get(hass).async_get(entity_id)
    if record is None or record.platform != DOMAIN or record.config_entry_id is None:
        return None
    entry = hass.config_entries.async_get_entry(record.config_entry_id)
    if entry is None or not hasattr(entry, "runtime_data"):
        return None
    data: LocationData = entry.runtime_data
    task = data.entities.get(entity_id)
    if task is None:
        return None
    return data.store, task


def _targets(
    hass: HomeAssistant, call: ServiceCall
) -> list[tuple[LocationStore, TaskDef]]:
    targets = []
    for entity_id in call.data["entity_id"]:
        target = _resolve(hass, entity_id)
        if target is None:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="not_a_task",
                translation_placeholders={"entity_id": entity_id},
            )
        targets.append(target)
    return targets


@callback
def _async_register_services(hass: HomeAssistant) -> None:
    """Register the services used by the card and by automations."""

    async def _async_reset(call: ServiceCall) -> None:
        when: datetime | None = call.data.get(ATTR_LAST_RESET)
        for store, task in _targets(hass, call):
            await store.async_reset(task.device_id, task.key, when)

    async def _async_set_frequency(call: ServiceCall) -> None:
        frequency = Frequency(
            unit=call.data[CONF_UNIT],
            value=call.data[CONF_VALUE],
            anchor=call.data.get(ATTR_ANCHOR),
        )
        try:
            for store, task in _targets(hass, call):
                await store.async_set_frequency(task.device_id, task.key, frequency)
        except ValueError as err:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="invalid_frequency",
                translation_placeholders={"error": str(err)},
            ) from err

    async def _async_set_notify(call: ServiceCall) -> None:
        for store, task in _targets(hass, call):
            await store.async_set_notify(
                task.device_id, task.key, call.data[ATTR_NOTIFY]
            )

    hass.services.async_register(
        DOMAIN, SERVICE_RESET, _async_reset, schema=SERVICE_RESET_SCHEMA
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_FREQUENCY,
        _async_set_frequency,
        schema=SERVICE_SET_FREQUENCY_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN, SERVICE_SET_NOTIFY, _async_set_notify, schema=SERVICE_SET_NOTIFY_SCHEMA
    )
