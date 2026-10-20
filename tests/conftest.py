"""Test fixtures for the Maintenance Hub integration.

Built for `pytest-homeassistant-custom-component`. The integration talks to
no hardware and no network; the only thing to fake is the frontend, whose
`hass_frontend` package is not installed in the test environment.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.components.frontend import DATA_EXTRA_MODULE_URL
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.maintenance_hub.const import (
    CONF_DEVICES,
    CONF_HA_DEVICE_ID,
    CONF_ID,
    CONF_NAME,
    CONF_TASKS,
    CONF_TEMPLATE,
    DOMAIN,
)


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Load `custom_components` in every test."""
    yield


class FakeUrlManager:
    """Stand-in for the frontend UrlManager."""

    def __init__(self) -> None:
        self.urls: set[str] = set()

    def add(self, url: str) -> None:
        self.urls.add(url)


@pytest.fixture
async def frontend(hass: HomeAssistant) -> AsyncGenerator[FakeUrlManager]:
    """Pretend `frontend` and `http` are set up, and record what we register."""
    hass.config.components.add("frontend")
    hass.config.components.add("http")
    manager = FakeUrlManager()
    hass.data[DATA_EXTRA_MODULE_URL] = manager  # type: ignore[assignment]
    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock()
    yield manager


def device(
    device_id: str = "dev1",
    name: str = "Pompe",
    tasks: list[dict[str, Any]] | None = None,
    template: str | None = "pool_filtration",
    ha_device_id: str | None = None,
) -> dict[str, Any]:
    """Build one device definition, as stored in `entry.options`."""
    return {
        CONF_ID: device_id,
        CONF_NAME: name,
        CONF_HA_DEVICE_ID: ha_device_id,
        CONF_TEMPLATE: template,
        CONF_TASKS: tasks
        if tasks is not None
        else [{"key": "pool_prefilter_clean"}, {"key": "pool_winterize"}],
    }


def make_entry(
    devices: list[dict[str, Any]] | None = None,
    name: str = "Maison",
    entry_id: str = "loc1",
) -> MockConfigEntry:
    """Build a location entry."""
    return MockConfigEntry(
        domain=DOMAIN,
        title=name,
        data={CONF_NAME: name},
        options={CONF_DEVICES: [device()] if devices is None else devices},
        entry_id=entry_id,
        unique_id=name.lower(),
    )


async def setup_entry(hass: HomeAssistant, entry: MockConfigEntry) -> MockConfigEntry:
    """Add and set up an entry."""
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry
