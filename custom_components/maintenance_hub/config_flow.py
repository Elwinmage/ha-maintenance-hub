"""Config and options flow (see doc/SPEC.md §8).

The config flow creates a location. The options flow adds, edits and removes
its devices; every change rewrites `entry.options`, which reloads the entry
and rebuilds the entity set. Frequencies are not edited here: the card and
the `set_frequency` service do it without a reload.
"""

from __future__ import annotations

import re
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.selector import (
    DeviceSelector,
    DeviceSelectorConfig,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)
from homeassistant.util import slugify

from .catalog import Catalog, load_catalog
from .const import (
    CONF_CUSTOM_TASKS,
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
    DOMAIN,
    MAX_VALUE,
    MIN_VALUE,
    UNIT_DAYS,
    UNIT_MONTHS,
    UNIT_WEEKS,
    UNIT_YEARS,
)
from .storage import custom_task_key, new_device_id

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

NO_TEMPLATE = "none"
CONF_DEVICE = "device"

# Unit words accepted in a custom task line, English and French.
UNIT_ALIASES: dict[str, str] = {
    "d": UNIT_DAYS, "day": UNIT_DAYS, "days": UNIT_DAYS,
    "j": UNIT_DAYS, "jour": UNIT_DAYS, "jours": UNIT_DAYS,
    "w": UNIT_WEEKS, "week": UNIT_WEEKS, "weeks": UNIT_WEEKS,
    "sem": UNIT_WEEKS, "semaine": UNIT_WEEKS, "semaines": UNIT_WEEKS,
    "m": UNIT_MONTHS, "month": UNIT_MONTHS, "months": UNIT_MONTHS,
    "mois": UNIT_MONTHS,
    "y": UNIT_YEARS, "year": UNIT_YEARS, "years": UNIT_YEARS,
    "a": UNIT_YEARS, "an": UNIT_YEARS, "ans": UNIT_YEARS,
    "annee": UNIT_YEARS, "annees": UNIT_YEARS, "année": UNIT_YEARS, "années": UNIT_YEARS,
}  # fmt: skip

_SPLIT_RE = re.compile(r"\s*;\s*")


def parse_custom_line(line: str) -> dict[str, Any]:
    """Parse "Label" or "Label ; value ; unit" into a task definition.

    Raises ValueError on a malformed line. The key is assigned later, once
    every line is known, so that two identical labels stay distinct.
    """
    parts = _SPLIT_RE.split(line.strip())
    label = parts[0].strip()
    if not label:
        raise ValueError("empty label")
    if len(parts) == 1:
        return {CONF_LABEL: label}
    if len(parts) != 3:
        raise ValueError(f"expected 'label ; value ; unit', got {line!r}")
    value = int(parts[1])
    if not MIN_VALUE <= value <= MAX_VALUE:
        raise ValueError(f"value out of range in {line!r}")
    unit = UNIT_ALIASES.get(parts[2].strip().lower())
    if unit is None:
        raise ValueError(f"unknown unit in {line!r}")
    return {CONF_LABEL: label, CONF_VALUE: value, CONF_UNIT: unit}


class MaintenanceHubConfigFlow(ConfigFlow, domain=DOMAIN):
    """Create one entry per location."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            name: str = user_input[CONF_NAME].strip()
            if not name:
                errors[CONF_NAME] = "empty_name"
            else:
                await self.async_set_unique_id(slugify(name))
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=name, data={CONF_NAME: name}, options={CONF_DEVICES: []}
                )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({vol.Required(CONF_NAME): TextSelector()}),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return MaintenanceHubOptionsFlow()


class MaintenanceHubOptionsFlow(OptionsFlow):
    """Add, edit and remove the devices of a location."""

    def __init__(self) -> None:
        self._catalog: Catalog | None = None
        # Device being added or edited, built across the steps.
        self._draft: dict[str, Any] = {}
        self._editing: bool = False

    # ---- helpers -----------------------------------------------------------

    @property
    def _devices(self) -> list[dict[str, Any]]:
        return list(self.config_entry.options.get(CONF_DEVICES, []))

    @property
    def _language(self) -> str:
        return self.hass.config.language

    async def _async_catalog(self) -> Catalog:
        if self._catalog is None:
            self._catalog = await self.hass.async_add_executor_job(
                load_catalog, self.hass.config.config_dir
            )
        assert self._catalog is not None
        return self._catalog

    def _device_label(self, raw: dict[str, Any]) -> str:
        if raw.get(CONF_HA_DEVICE_ID):
            entry = dr.async_get(self.hass).async_get(raw[CONF_HA_DEVICE_ID])
            if entry is not None:
                return entry.name_by_user or entry.name or raw.get(CONF_NAME, "")
        return str(raw.get(CONF_NAME) or raw[CONF_ID])

    def _device_selector(self) -> SelectSelector:
        return SelectSelector(
            SelectSelectorConfig(
                options=[
                    SelectOptionDict(value=raw[CONF_ID], label=self._device_label(raw))
                    for raw in self._devices
                ],
                mode=SelectSelectorMode.DROPDOWN,
            )
        )

    def _save(self, devices: list[dict[str, Any]]) -> ConfigFlowResult:
        return self.async_create_entry(
            data={**self.config_entry.options, CONF_DEVICES: devices}
        )

    # ---- menu --------------------------------------------------------------

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        menu = ["add", "edit", "remove"] if self._devices else ["add"]
        return self.async_show_menu(step_id="init", menu_options=menu)

    # ---- add ---------------------------------------------------------------

    async def async_step_add(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        catalog = await self._async_catalog()
        errors: dict[str, str] = {}
        if user_input is not None:
            ha_device_id = user_input.get(CONF_HA_DEVICE_ID) or None
            name = (user_input.get(CONF_NAME) or "").strip()
            if ha_device_id is None and not name:
                errors["base"] = "device_or_name"
            else:
                if not name and ha_device_id:
                    entry = dr.async_get(self.hass).async_get(ha_device_id)
                    name = (entry.name_by_user or entry.name or "") if entry else ""
                template = user_input.get(CONF_TEMPLATE, NO_TEMPLATE)
                self._draft = {
                    CONF_ID: new_device_id(),
                    CONF_NAME: name,
                    CONF_HA_DEVICE_ID: ha_device_id,
                    CONF_TEMPLATE: None if template == NO_TEMPLATE else template,
                    CONF_TASKS: [],
                }
                self._editing = False
                return await self.async_step_tasks()

        templates = sorted(
            catalog.templates.values(), key=lambda tpl: tpl.name(self._language)
        )
        template_selector = SelectSelector(
            SelectSelectorConfig(
                options=[SelectOptionDict(value=NO_TEMPLATE, label="—")]
                + [
                    SelectOptionDict(value=tpl.key, label=tpl.name(self._language))
                    for tpl in templates
                ],
                mode=SelectSelectorMode.DROPDOWN,
            )
        )
        return self.async_show_form(
            step_id="add",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_HA_DEVICE_ID): DeviceSelector(
                        DeviceSelectorConfig()
                    ),
                    vol.Optional(CONF_NAME): TextSelector(),
                    vol.Optional(CONF_TEMPLATE, default=NO_TEMPLATE): template_selector,
                }
            ),
            errors=errors,
        )

    # ---- tasks (shared by add and edit) --------------------------------------

    async def async_step_tasks(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        catalog = await self._async_catalog()
        errors: dict[str, str] = {}
        current: list[dict[str, Any]] = self._draft[CONF_TASKS]

        if user_input is not None:
            try:
                customs = [
                    parse_custom_line(line)
                    for line in user_input.get(CONF_CUSTOM_TASKS, [])
                    if line and line.strip()
                ]
            except ValueError:
                errors[CONF_CUSTOM_TASKS] = "invalid_custom_task"
            else:
                selected = [str(key) for key in user_input.get(CONF_TASKS, [])]
                if not selected and not customs:
                    errors["base"] = "no_task"
                else:
                    self._draft[CONF_TASKS] = self._merge_tasks(
                        current, selected, customs
                    )
                    return self._commit()

        if current:
            default_keys = [
                t[CONF_KEY]
                for t in current
                if not t[CONF_KEY].startswith(CUSTOM_PREFIX)
            ]
        elif self._draft.get(CONF_TEMPLATE) in catalog.templates:
            default_keys = [
                ref.key for ref in catalog.templates[self._draft[CONF_TEMPLATE]].tasks
            ]
        else:
            default_keys = []
        default_customs = [
            t[CONF_LABEL] for t in current if t[CONF_KEY].startswith(CUSTOM_PREFIX)
        ]

        tasks = sorted(catalog.tasks.values(), key=lambda t: t.name(self._language))
        return self.async_show_form(
            step_id="tasks",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_TASKS, default=default_keys): SelectSelector(
                        SelectSelectorConfig(
                            options=[
                                SelectOptionDict(
                                    value=t.key, label=t.name(self._language)
                                )
                                for t in tasks
                            ],
                            mode=SelectSelectorMode.DROPDOWN,
                            multiple=True,
                        )
                    ),
                    vol.Optional(
                        CONF_CUSTOM_TASKS, default=default_customs
                    ): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.TEXT, multiple=True)
                    ),
                }
            ),
            description_placeholders={"device": self._draft.get(CONF_NAME) or ""},
            errors=errors,
        )

    @staticmethod
    def _merge_tasks(
        current: list[dict[str, Any]],
        selected: list[str],
        customs: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """Build the new task list, keeping the keys of unchanged custom tasks.

        A custom task keeps its key (hence its history) as long as its label
        is unchanged.
        """
        tasks: list[dict[str, Any]] = [{CONF_KEY: key} for key in selected]
        existing = {
            t[CONF_LABEL]: t for t in current if t[CONF_KEY].startswith(CUSTOM_PREFIX)
        }
        taken = set(selected)
        for custom in customs:
            previous = existing.pop(custom[CONF_LABEL], None)
            if previous is not None:
                key = previous[CONF_KEY]
                tasks.append({**previous, **custom, CONF_KEY: key})
            else:
                key = custom_task_key(custom[CONF_LABEL], taken)
                tasks.append({CONF_KEY: key, **custom})
            taken.add(key)
        return tasks

    def _commit(self) -> ConfigFlowResult:
        devices = self._devices
        if self._editing:
            devices = [
                self._draft if raw[CONF_ID] == self._draft[CONF_ID] else raw
                for raw in devices
            ]
        else:
            devices.append(self._draft)
        return self._save(devices)

    # ---- edit --------------------------------------------------------------

    async def async_step_edit(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            raw = next(
                d for d in self._devices if d[CONF_ID] == user_input[CONF_DEVICE]
            )
            self._draft = {**raw, CONF_TASKS: list(raw.get(CONF_TASKS, []))}
            self._editing = True
            return await self.async_step_edit_device()
        return self.async_show_form(
            step_id="edit",
            data_schema=vol.Schema(
                {vol.Required(CONF_DEVICE): self._device_selector()}
            ),
        )

    async def async_step_edit_device(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            name = (user_input.get(CONF_NAME) or "").strip()
            if not name and not self._draft.get(CONF_HA_DEVICE_ID):
                errors[CONF_NAME] = "empty_name"
            else:
                self._draft[CONF_NAME] = name or self._draft.get(CONF_NAME, "")
                return await self.async_step_tasks()
        return self.async_show_form(
            step_id="edit_device",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_NAME, default=self._draft.get(CONF_NAME, "")
                    ): TextSelector()
                }
            ),
            errors=errors,
        )

    # ---- remove ------------------------------------------------------------

    async def async_step_remove(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            return self._save(
                [d for d in self._devices if d[CONF_ID] != user_input[CONF_DEVICE]]
            )
        return self.async_show_form(
            step_id="remove",
            data_schema=vol.Schema(
                {vol.Required(CONF_DEVICE): self._device_selector()}
            ),
        )
