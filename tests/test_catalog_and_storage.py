"""Catalog loading and device/state models."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest

from custom_components.maintenance_hub.catalog import (
    Catalog,
    load_catalog,
    localize,
    merge_raw,
)
from custom_components.maintenance_hub.schedule import Frequency
from custom_components.maintenance_hub.storage import (
    CUSTOM_DEFAULT,
    TaskState,
    build_devices,
    custom_task_key,
    new_device_id,
)


@pytest.fixture(scope="module")
def catalog() -> Catalog:
    return load_catalog()


def test_bundled_catalog_is_consistent(catalog: Catalog) -> None:
    assert len(catalog.tasks) >= 70
    assert len(catalog.templates) >= 25
    for task in catalog.tasks.values():
        assert task.names.get("en") and task.names.get("fr"), task.key
        assert task.icon.startswith("mdi:")
    for template in catalog.templates.values():
        assert template.names.get("en") and template.names.get("fr"), template.key
        assert template.tasks


def test_regulatory_and_seasonal_flags(catalog: Catalog) -> None:
    boiler = catalog.tasks["boiler_service"]
    assert boiler.regulatory
    assert boiler.frequency == Frequency("years", 1, "09-01")
    assert not catalog.tasks["pool_prefilter_clean"].regulatory


def test_template_override(catalog: Catalog) -> None:
    assert catalog.task_frequency("boiler_service").anchor == "09-01"
    assert catalog.task_frequency("boiler_service", "pellet_stove").anchor == "09-15"
    # A template not listing the task, or an unknown template, keeps the base.
    assert catalog.task_frequency("boiler_service", "gas_boiler").anchor == "09-01"
    assert catalog.task_frequency("boiler_service", "nope").anchor == "09-01"


def test_localize() -> None:
    names = {"en": "Clean", "fr": "Nettoyer"}
    assert localize(names, "fr", "k") == "Nettoyer"
    assert localize(names, "fr-CA", "k") == "Nettoyer"
    assert localize(names, "de", "k") == "Clean"
    assert localize({"fr": "Nettoyer"}, "de", "k") == "Nettoyer"
    assert localize({}, "de", "k") == "k"


def test_user_catalog_merges(tmp_path: Path, catalog: Catalog) -> None:
    folder = tmp_path / "maintenance_hub"
    folder.mkdir()
    (folder / "catalog.json").write_text(
        json.dumps(
            {
                "tasks": {
                    "boat_antifouling": {
                        "name": {"en": "Antifouling"},
                        "unit": "years",
                        "value": 1,
                        "anchor": "03-01",
                    },
                    "broken": {"name": {"en": "x"}, "unit": "hours", "value": 1},
                    "pool_backwash": {
                        "name": {"en": "Backwash"},
                        "unit": "weeks",
                        "value": 1,
                    },
                },
                "templates": {
                    "boat": {"name": {"en": "Boat"}, "tasks": ["boat_antifouling"]},
                    "bad": {"name": {"en": "Bad"}, "tasks": ["missing"]},
                    "worse": {"tasks": [{"value": 1}]},
                },
            }
        ),
        encoding="utf-8",
    )
    merged = load_catalog(str(tmp_path))
    assert "boat_antifouling" in merged.tasks
    assert "broken" not in merged.tasks
    assert merged.tasks["pool_backwash"].frequency.value == 1
    assert "boat" in merged.templates
    assert "bad" not in merged.templates
    assert "worse" not in merged.templates
    assert merged.templates["boat"].category == "other"
    assert merged.tasks["boat_antifouling"].icon == "mdi:wrench-check"


def test_user_catalog_unreadable(tmp_path: Path) -> None:
    folder = tmp_path / "maintenance_hub"
    folder.mkdir()
    (folder / "catalog.json").write_text("{not json", encoding="utf-8")
    assert "pool_backwash" in load_catalog(str(tmp_path)).tasks


def test_merge_raw_empty() -> None:
    catalog = Catalog()
    merge_raw(catalog, {}, "empty")
    assert not catalog.tasks


def test_template_name(catalog: Catalog) -> None:
    assert (
        catalog.templates["pool_heat_pump"].name("fr") == "Pompe à chaleur de piscine"
    )


def test_build_devices(catalog: Catalog) -> None:
    devices = build_devices(
        {
            "devices": [
                {
                    "id": "d1",
                    "name": "Chaudière",
                    "template": "pellet_stove",
                    "tasks": [
                        {"key": "boiler_service"},
                        {"key": "boiler_service"},
                        {
                            "key": "custom_graisser",
                            "label": "Graisser",
                            "unit": "weeks",
                            "value": 3,
                        },
                        {
                            "key": "custom_bad",
                            "label": "Bad",
                            "unit": "hours",
                            "value": 3,
                        },
                        {"key": "vanished"},
                    ],
                }
            ]
        },
        catalog,
        "fr",
    )
    (dev,) = devices
    assert dev.ha_device_id is None
    keys = [t.key for t in dev.tasks]
    assert keys == ["boiler_service", "custom_graisser", "custom_bad", "vanished"]
    boiler, custom, bad, vanished = dev.tasks
    assert boiler.name == "Entretien annuel de la chaudière"
    assert boiler.regulatory and boiler.default.anchor == "09-15"
    assert custom.is_custom and custom.name == "Graisser"
    assert custom.default == Frequency("weeks", 3)
    assert bad.default == CUSTOM_DEFAULT
    assert vanished.name == "vanished" and vanished.default == CUSTOM_DEFAULT


def test_custom_task_key() -> None:
    assert custom_task_key("Graisser l'axe", []) == "custom_graisser_l_axe"
    assert custom_task_key("Graisser", ["custom_graisser"]) == "custom_graisser_2"
    assert custom_task_key("!!!", []).startswith("custom_")
    assert len(new_device_id()) == 6


def test_task_state_roundtrip() -> None:
    moment = datetime(2026, 10, 19, 9, 30, tzinfo=ZoneInfo("Europe/Paris"))
    state = TaskState(Frequency("years", 1, "10-15"), moment, False)
    assert TaskState.from_dict(state.as_dict(), CUSTOM_DEFAULT) == state


def test_task_state_broken_frequency() -> None:
    state = TaskState.from_dict({"unit": "x", "value": 1}, CUSTOM_DEFAULT)
    assert state.frequency == CUSTOM_DEFAULT
    assert state.last_reset is None
    assert state.notify is True
