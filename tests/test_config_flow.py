"""Config and options flow."""

from __future__ import annotations

import pytest
from homeassistant.config_entries import SOURCE_USER
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import device_registry as dr
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.maintenance_hub.config_flow import parse_custom_line
from custom_components.maintenance_hub.const import DOMAIN

from .conftest import device, make_entry, setup_entry

pytestmark = pytest.mark.usefixtures("frontend")


@pytest.mark.parametrize(
    ("line", "expected"),
    [
        ("Graisser", {"label": "Graisser"}),
        ("Graisser ; 2 ; semaines", {"label": "Graisser", "value": 2, "unit": "weeks"}),
        ("Vidange;1;an", {"label": "Vidange", "value": 1, "unit": "years"}),
        ("Filtre ; 10 ; days", {"label": "Filtre", "value": 10, "unit": "days"}),
    ],
)
def test_parse_custom_line(line: str, expected: dict) -> None:
    assert parse_custom_line(line) == expected


@pytest.mark.parametrize(
    "line",
    ["", " ; 2 ; weeks", "A ; 2", "A ; x ; weeks", "A ; 0 ; weeks", "A ; 2 ; hours"],
)
def test_parse_custom_line_invalid(line: str) -> None:
    with pytest.raises(ValueError):
        parse_custom_line(line)


async def test_user_flow(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "  "}
    )
    assert result["errors"] == {"name": "empty_name"}

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "Maison de vacances"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Maison de vacances"
    assert result["data"] == {"name": "Maison de vacances"}
    assert result["options"] == {"devices": []}

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"name": "Maison de vacances"}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_options_add_manual_device(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass, make_entry([]))

    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.MENU
    assert result["menu_options"] == ["add"]

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "add"}
    )
    assert result["step_id"] == "add"
    result = await hass.config_entries.options.async_configure(result["flow_id"], {})
    assert result["errors"] == {"base": "device_or_name"}

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"name": "Arrosage", "template": "irrigation"}
    )
    assert result["step_id"] == "tasks"
    # The template preselects its tasks.
    schema = result["data_schema"].schema  # type: ignore[union-attr]
    defaults = {str(k): k.default() for k in schema}
    assert defaults["tasks"] == [
        "irrigation_prefilter",
        "irrigation_winterize",
        "irrigation_restart",
        "irrigation_controller_batteries",
    ]

    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"tasks": [], "custom_tasks": []}
    )
    assert result["errors"] == {"base": "no_task"}

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {"tasks": ["irrigation_prefilter"], "custom_tasks": ["A ; x"]},
    )
    assert result["errors"] == {"custom_tasks": "invalid_custom_task"}

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {
            "tasks": ["irrigation_prefilter"],
            "custom_tasks": ["Vérifier les goutteurs ; 2 ; semaines", "  "],
        },
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()

    (dev,) = entry.options["devices"]
    assert dev["name"] == "Arrosage"
    assert dev["template"] == "irrigation"
    assert dev["ha_device_id"] is None
    assert dev["tasks"] == [
        {"key": "irrigation_prefilter"},
        {
            "key": "custom_verifier_les_goutteurs",
            "label": "Vérifier les goutteurs",
            "value": 2,
            "unit": "weeks",
        },
    ]
    assert hass.states.get("sensor.arrosage_verifier_les_goutteurs") is not None


async def test_options_add_ha_device(hass: HomeAssistant) -> None:
    other = MockConfigEntry(domain="other")
    other.add_to_hass(hass)
    pump = dr.async_get(hass).async_get_or_create(
        config_entry_id=other.entry_id, identifiers={("other", "p")}, name="PAC"
    )
    entry = await setup_entry(hass, make_entry([]))

    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "add"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"ha_device_id": pump.id}
    )
    assert result["step_id"] == "tasks"
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"tasks": ["hp_outdoor_clean"]}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    (dev,) = entry.options["devices"]
    assert dev["name"] == "PAC"
    assert dev["ha_device_id"] == pump.id
    assert dev["template"] is None


async def test_options_add_unknown_ha_device(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass, make_entry([]))
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "add"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"ha_device_id": "gone"}
    )
    # No template: nothing preselected.
    schema = result["data_schema"].schema  # type: ignore[union-attr]
    assert {str(k): k.default() for k in schema}["tasks"] == []


async def test_options_edit_device(hass: HomeAssistant) -> None:
    entry = await setup_entry(
        hass,
        make_entry(
            [
                device(
                    tasks=[
                        {"key": "pool_prefilter_clean"},
                        {
                            "key": "custom_graisser",
                            "label": "Graisser",
                            "unit": "weeks",
                            "value": 3,
                        },
                    ]
                ),
                device("dev2", "Autre", template=None, ha_device_id="gone"),
            ]
        ),
    )
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["menu_options"] == ["add", "edit", "remove"]
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "edit"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"device": "dev1"}
    )
    assert result["step_id"] == "edit_device"
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"name": ""}
    )
    assert result["errors"] == {"name": "empty_name"}
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"name": "Pompe filtration"}
    )
    assert result["step_id"] == "tasks"
    schema = result["data_schema"].schema  # type: ignore[union-attr]
    defaults = {str(k): k.default() for k in schema}
    assert defaults == {"tasks": ["pool_prefilter_clean"], "custom_tasks": ["Graisser"]}

    result = await hass.config_entries.options.async_configure(
        result["flow_id"],
        {"tasks": ["pool_backwash"], "custom_tasks": ["Graisser", "Nouveau ; 1 ; an"]},
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    dev = entry.options["devices"][0]
    assert dev["name"] == "Pompe filtration"
    assert dev["tasks"] == [
        {"key": "pool_backwash"},
        {"key": "custom_graisser", "label": "Graisser", "unit": "weeks", "value": 3},
        {"key": "custom_nouveau", "label": "Nouveau", "value": 1, "unit": "years"},
    ]
    assert entry.options["devices"][1]["name"] == "Autre"


async def test_options_edit_linked_device_keeps_name(hass: HomeAssistant) -> None:
    other = MockConfigEntry(domain="other")
    other.add_to_hass(hass)
    pump = dr.async_get(hass).async_get_or_create(
        config_entry_id=other.entry_id, identifiers={("other", "p")}, name="PAC"
    )
    entry = await setup_entry(
        hass, make_entry([device(name="PAC", ha_device_id=pump.id)])
    )
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "edit"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"device": "dev1"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"name": ""}
    )
    assert result["step_id"] == "tasks"


async def test_options_remove_device(hass: HomeAssistant) -> None:
    entry = await setup_entry(hass, make_entry([device(), device("dev2", "Arrosage")]))
    result = await hass.config_entries.options.async_init(entry.entry_id)
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"next_step_id": "remove"}
    )
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"device": "dev1"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    await hass.async_block_till_done()
    assert [d["id"] for d in entry.options["devices"]] == ["dev2"]
