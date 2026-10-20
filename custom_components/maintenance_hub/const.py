"""Constants for the Maintenance Hub integration."""

from __future__ import annotations

from typing import Final

from homeassistant.const import Platform

DOMAIN: Final[str] = "maintenance_hub"

PLATFORMS: Final[list[Platform]] = [Platform.SENSOR, Platform.TODO]

# ── Config entry keys ─────────────────────────────────────────────────────
# entry.data holds what defines the location; entry.options the device
# definitions. Task state (last reset, frequency, notify) lives in the Store
# instead, because updating options reloads the entry.
CONF_NAME: Final[str] = "name"
CONF_DEVICES: Final[str] = "devices"
CONF_ID: Final[str] = "id"
CONF_HA_DEVICE_ID: Final[str] = "ha_device_id"
CONF_TEMPLATE: Final[str] = "template"
CONF_TASKS: Final[str] = "tasks"
CONF_KEY: Final[str] = "key"
CONF_LABEL: Final[str] = "label"
CONF_UNIT: Final[str] = "unit"
CONF_VALUE: Final[str] = "value"
CONF_ANCHOR: Final[str] = "anchor"
CONF_CUSTOM_TASKS: Final[str] = "custom_tasks"

# ── Frequency ─────────────────────────────────────────────────────────────
UNIT_DAYS: Final[str] = "days"
UNIT_WEEKS: Final[str] = "weeks"
UNIT_MONTHS: Final[str] = "months"
UNIT_YEARS: Final[str] = "years"
VALID_UNITS: Final[tuple[str, ...]] = (UNIT_DAYS, UNIT_WEEKS, UNIT_MONTHS, UNIT_YEARS)
MIN_VALUE: Final[int] = 1
MAX_VALUE: Final[int] = 999

# ── Entity contract (see doc/SPEC.md §4) ──────────────────────────────────
# Deliberately not `reef_role`: ha-reef-card must not pick these tasks up,
# while the maintenance-hub-card reads both markers.
ROLE_ATTR: Final[str] = "maint_role"
ROLE_PREFIX: Final[str] = "maint_"
CUSTOM_PREFIX: Final[str] = "custom_"
DEFAULT_ICON: Final[str] = "mdi:wrench-check"

ATTR_TASK_KEY: Final[str] = "task_key"
ATTR_FREQUENCY_UNIT: Final[str] = "frequency_unit"
ATTR_FREQUENCY_VALUE: Final[str] = "frequency_value"
ATTR_ANCHOR: Final[str] = "anchor"
ATTR_INTERVAL_DAYS: Final[str] = "interval_days"
ATTR_DAYS_LEFT: Final[str] = "days_left"
ATTR_OVERDUE: Final[str] = "overdue"
ATTR_LAST_RESET: Final[str] = "last_reset"
ATTR_NOTIFY: Final[str] = "notify"
ATTR_REGULATORY: Final[str] = "regulatory"
ATTR_LOCATION_ID: Final[str] = "location_id"
ATTR_LOCATION_NAME: Final[str] = "location_name"

# Same rule as the card: the last 20% of the interval is the warning window.
WARNING_RATIO: Final[float] = 0.2

# ── Services ──────────────────────────────────────────────────────────────
SERVICE_RESET: Final[str] = "reset"
SERVICE_SET_FREQUENCY: Final[str] = "set_frequency"
SERVICE_SET_NOTIFY: Final[str] = "set_notify"

# ── Frontend ──────────────────────────────────────────────────────────────
FRONTEND_URL_BASE: Final[str] = f"/{DOMAIN}/frontend"
CARD_FILENAME: Final[str] = "maintenance-hub-card.js"

# ── Catalog ───────────────────────────────────────────────────────────────
CATALOG_FILENAME: Final[str] = "catalog.json"
# User catalog, merged over the bundled one: <config>/maintenance_hub/catalog.json
USER_CATALOG_DIR: Final[str] = DOMAIN
FALLBACK_LANGUAGE: Final[str] = "en"
