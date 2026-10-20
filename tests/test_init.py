"""Setup, entities, services, to-do list."""

from __future__ import annotations

from datetime import timedelta
from typing import Any, cast

import pytest
from freezegun.api import FrozenDateTimeFactory
from homeassistant.components.todo import DOMAIN as TODO_DOMAIN
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
)

from custom_components.maintenance_hub import async_remove_config_entry_device
from custom_components.maintenance_hub.const import DOMAIN

from .conftest import FakeUrlManager, device, make_entry, setup_entry

pytestmark = pytest.mark.usefixtures("frontend")

PREFILTER = "sensor.pompe_nettoyer_le_panier_du_pre_filtre_de_la_pompe"
WINTERIZE = "sensor.pompe_hivernage_de_la_piscine"


@pytest.fixture(autouse=True)
async def french(hass: HomeAssistant, freezer: FrozenDateTimeFactory) -> None:
    """French UI, Paris time, Monday 19 October 2026 10:00."""
    hass.config.language = "fr"
    await hass.config.async_set_time_zone("Europe/Paris")
    freezer.move_to("2026-10-19 08:00:00+00:00")


def _entity_id(hass: HomeAssistant, unique_id: str) -> str:
    entity_id = er.async_get(hass).async_get_entity_id("sensor", DOMAIN, unique_id)
    assert entity_id is not None
    return entity_id


async def _todo_items(hass: HomeAssistant) -> list[dict[str, Any]]:
    result = await hass.services.async_call(
        TODO_DOMAIN,
        "get_items",
        {"entity_id": "todo.maison"},
        blocking=True,
        return_response=True,
    )
    return cast(
        "list[dict[str, Any]]", cast("dict[str, Any]", result)["todo.maison"]["items"]
    )


def _todo_count(hass: HomeAssistant) -> str:
    state = hass.states.get("todo.maison")
    assert state is not None
    return state.state


async def test_setup_creates_entities(
    hass: HomeAssistant, frontend: FakeUrlManager
) -> None:
    entry = await setup_entry(hass, make_entry())
    assert entry.state is ConfigEntryState.LOADED

    prefilter = hass.states.get(_entity_id(hass, "loc1_dev1_pool_prefilter_clean"))
    assert prefilter is not None
    assert prefilter.state == "unknown"
    attrs = prefilter.attributes
    assert attrs["maint_role"] == "maint_pool_prefilter_clean"
    assert attrs["task_key"] == "pool_prefilter_clean"
    assert attrs["frequency_unit"] == "weeks"
    assert attrs["frequency_value"] == 1
    assert attrs["anchor"] is None
    assert attrs["days_left"] is None
    assert attrs["interval_days"] == 0
    assert attrs["overdue"] is False
    assert attrs["last_reset"] is None
    assert attrs["notify"] is True
    assert attrs["regulatory"] is False
    assert attrs["location_id"] == "loc1"
    assert attrs["location_name"] == "Maison"
    assert attrs["icon"] == "mdi:filter-variant"
    assert attrs["device_class"] == "timestamp"

    # Seasonal and never done: next anchor from today.
    winter = hass.states.get(_entity_id(hass, "loc1_dev1_pool_winterize"))
    assert winter is not None
    assert dt_util.parse_datetime(winter.state) == dt_util.parse_datetime(
        "2027-10-15T00:00:00+02:00"
    )
    assert winter.attributes["anchor"] == "10-15"
    assert winter.attributes["days_left"] == 361

    # Manual device under the location hub.
    registry = dr.async_get(hass)
    hub = registry.async_get_device_by_identifier((DOMAIN, "loc1"), "loc1")
    pump = registry.async_get_device_by_identifier((DOMAIN, "loc1_dev1"), "loc1")
    assert hub is not None and pump is not None
    assert pump.via_device_id == hub.id
    assert pump.name == "Pompe"

    # The card is served and loaded on every dashboard.
    assert any(url.startswith("/maintenance_hub/frontend/") for url in frontend.urls)
    hass.http.async_register_static_paths.assert_awaited_once()  # type: ignore[union-attr]

    assert hass.states.get("todo.maison") is not None


async def test_reset_and_services(hass: HomeAssistant) -> None:
    await setup_entry(hass, make_entry())
    prefilter = _entity_id(hass, "loc1_dev1_pool_prefilter_clean")

    await hass.services.async_call(
        DOMAIN, "reset", {"entity_id": [prefilter]}, blocking=True
    )
    state = hass.states.get(prefilter)
    assert state is not None
    assert state.attributes["days_left"] == 7
    assert state.attributes["interval_days"] == 7
    assert dt_util.parse_datetime(state.state) == dt_util.parse_datetime(
        "2026-10-26T10:00:00+01:00"
    )

    await hass.services.async_call(
        DOMAIN,
        "reset",
        {"entity_id": [prefilter], "last_reset": "2026-10-01 18:00:00"},
        blocking=True,
    )
    state = hass.states.get(prefilter)
    assert state is not None
    assert state.attributes["days_left"] == -11
    assert state.attributes["overdue"] is True
    assert state.attributes["last_reset"].startswith("2026-10-01T18:00:00")

    await hass.services.async_call(
        DOMAIN,
        "set_frequency",
        {"entity_id": [prefilter], "unit": "months", "value": 1},
        blocking=True,
    )
    state = hass.states.get(prefilter)
    assert state is not None
    assert state.attributes["frequency_unit"] == "months"
    assert state.attributes["days_left"] == 13

    await hass.services.async_call(
        DOMAIN,
        "set_frequency",
        {"entity_id": [prefilter], "unit": "years", "value": 1, "anchor": "04-15"},
        blocking=True,
    )
    state = hass.states.get(prefilter)
    assert state is not None
    assert state.attributes["anchor"] == "04-15"
    # Done 2026-10-01: threshold +6 months -> 2027-04-01 -> anchor 2027-04-15.
    assert dt_util.parse_datetime(state.state) == dt_util.parse_datetime(
        "2027-04-15T00:00:00+02:00"
    )

    await hass.services.async_call(
        DOMAIN, "set_notify", {"entity_id": [prefilter], "notify": False}, blocking=True
    )
    state = hass.states.get(prefilter)
    assert state is not None
    assert state.attributes["notify"] is False


async def test_service_errors(hass: HomeAssistant) -> None:
    await setup_entry(hass, make_entry())
    prefilter = _entity_id(hass, "loc1_dev1_pool_prefilter_clean")

    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN,
            "set_frequency",
            {"entity_id": [prefilter], "unit": "months", "value": 1, "anchor": "10-15"},
            blocking=True,
        )
    with pytest.raises(Exception, match="anchor"):
        await hass.services.async_call(
            DOMAIN,
            "set_frequency",
            {"entity_id": [prefilter], "unit": "years", "value": 1, "anchor": "1015"},
            blocking=True,
        )
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "reset", {"entity_id": ["sensor.unknown"]}, blocking=True
        )
    # An entity of another integration is not a task either.
    er.async_get(hass).async_get_or_create(
        "sensor", "other", "x", suggested_object_id="other"
    )
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "reset", {"entity_id": ["sensor.other"]}, blocking=True
        )
    # The to-do list belongs to the integration but is not a task.
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "reset", {"entity_id": ["todo.maison"]}, blocking=True
        )
    # Clearing the anchor with an empty string is allowed.
    await hass.services.async_call(
        DOMAIN,
        "set_frequency",
        {"entity_id": [prefilter], "unit": "weeks", "value": 2, "anchor": ""},
        blocking=True,
    )


async def test_service_on_unloaded_entry(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass, make_entry())
    prefilter = _entity_id(hass, "loc1_dev1_pool_prefilter_clean")
    await hass.config_entries.async_unload(entry.entry_id)
    with pytest.raises(ServiceValidationError):
        await hass.services.async_call(
            DOMAIN, "reset", {"entity_id": [prefilter]}, blocking=True
        )


async def test_todo_lists_due_tasks(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await setup_entry(hass, make_entry())
    prefilter = _entity_id(hass, "loc1_dev1_pool_prefilter_clean")
    assert _todo_count(hass) == "0"

    await hass.services.async_call(
        DOMAIN,
        "reset",
        {"entity_id": [prefilter], "last_reset": "2026-10-10 10:00:00"},
        blocking=True,
    )
    assert _todo_count(hass) == "1"

    items = await _todo_items(hass)
    assert len(items) == 1
    assert items[0]["summary"] == "Pompe · Nettoyer le panier du pré-filtre de la pompe"
    assert items[0]["due"] == "2026-10-17"

    # Creating items is not supported.
    with pytest.raises(HomeAssistantError):
        await hass.services.async_call(
            TODO_DOMAIN,
            "add_item",
            {"entity_id": "todo.maison", "item": "x"},
            blocking=True,
        )

    # Renaming an item without completing it does nothing.
    await hass.services.async_call(
        TODO_DOMAIN,
        "update_item",
        {"entity_id": "todo.maison", "item": items[0]["uid"], "rename": "x"},
        blocking=True,
    )
    assert _todo_count(hass) == "1"

    await hass.services.async_call(
        TODO_DOMAIN,
        "update_item",
        {"entity_id": "todo.maison", "item": items[0]["uid"], "status": "completed"},
        blocking=True,
    )
    assert _todo_count(hass) == "0"
    state = hass.states.get(prefilter)
    assert state is not None and state.attributes["days_left"] == 7


async def test_midnight_refresh(
    hass: HomeAssistant, freezer: FrozenDateTimeFactory
) -> None:
    await setup_entry(hass, make_entry())
    prefilter = _entity_id(hass, "loc1_dev1_pool_prefilter_clean")
    await hass.services.async_call(
        DOMAIN, "reset", {"entity_id": [prefilter]}, blocking=True
    )
    freezer.tick(timedelta(days=1))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    freezer.move_to("2026-10-20 22:00:05+00:00")
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    state = hass.states.get(prefilter)
    assert state is not None and state.attributes["days_left"] == 5


async def test_link_to_existing_device(hass: HomeAssistant) -> None:
    other = MockConfigEntry(domain="other")
    other.add_to_hass(hass)
    registry = dr.async_get(hass)
    pump = registry.async_get_or_create(
        config_entry_id=other.entry_id,
        identifiers={("other", "pump")},
        name="Pompe Modbus",
    )
    await setup_entry(
        hass,
        make_entry(
            [
                device(ha_device_id=pump.id, name="Pompe Modbus"),
                device("dev2", "Ghost", ha_device_id="missing-device"),
            ]
        ),
    )

    record = er.async_get(hass).async_get(
        _entity_id(hass, "loc1_dev1_pool_prefilter_clean")
    )
    assert record is not None and record.device_id == pump.id
    # The foreign device is not claimed by our entry.
    pump = registry.async_get(pump.id)
    assert pump is not None and pump.config_entry_id == other.entry_id

    # A linked device that vanished falls back on a manual one.
    ghost = registry.async_get_device_by_identifier((DOMAIN, "loc1_dev2"), "loc1")
    assert ghost is not None and ghost.name == "Ghost"

    # The to-do uses the HA device name.
    registry.async_update_device(pump.id, name_by_user="Ma pompe")
    prefilter = _entity_id(hass, "loc1_dev1_pool_prefilter_clean")
    await hass.services.async_call(
        DOMAIN,
        "reset",
        {"entity_id": [prefilter], "last_reset": "2026-10-10 10:00:00"},
        blocking=True,
    )
    summary = (await _todo_items(hass))[0]["summary"]
    assert summary.startswith("Ma pompe · ")


async def test_options_change_cleans_up(hass: HomeAssistant) -> None:
    entry = await setup_entry(
        hass, make_entry([device(), device("dev2", "Arrosage", template="irrigation")])
    )
    registry = er.async_get(hass)
    assert registry.async_get_entity_id("sensor", DOMAIN, "loc1_dev1_pool_winterize")

    hass.config_entries.async_update_entry(
        entry,
        options={"devices": [device(tasks=[{"key": "pool_prefilter_clean"}])]},
    )
    await hass.async_block_till_done()

    assert (
        registry.async_get_entity_id("sensor", DOMAIN, "loc1_dev1_pool_winterize")
        is None
    )
    assert (
        dr.async_get(hass).async_get_device_by_identifier((DOMAIN, "loc1_dev2"), "loc1")
        is None
    )


async def test_remove_device_from_device_page(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass, make_entry())
    registry = dr.async_get(hass)
    hub = registry.async_get_device_by_identifier((DOMAIN, "loc1"), "loc1")
    pump = registry.async_get_device_by_identifier((DOMAIN, "loc1_dev1"), "loc1")
    assert hub is not None and pump is not None

    assert not await async_remove_config_entry_device(hass, entry, hub)
    assert await async_remove_config_entry_device(hass, entry, pump)
    await hass.async_block_till_done()
    assert entry.options["devices"] == []


async def test_unload(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass, make_entry())
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert entry.state is ConfigEntryState.NOT_LOADED
