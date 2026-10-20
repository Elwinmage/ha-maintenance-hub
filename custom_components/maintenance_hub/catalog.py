"""Task and template catalog (see doc/SPEC.md §7).

The bundled `catalog.json` is merged with an optional user catalog
(`<config>/maintenance_hub/catalog.json`, same format): keys of the user file
add to or replace the bundled ones. Names are embedded per language, with a
fallback on English, so adding a task is a JSON-only change.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .const import (
    CATALOG_FILENAME,
    DEFAULT_ICON,
    FALLBACK_LANGUAGE,
    USER_CATALOG_DIR,
)
from .schedule import Frequency, validate_frequency

_LOGGER = logging.getLogger(__name__)

BUNDLED_CATALOG: Path = Path(__file__).parent / CATALOG_FILENAME


@dataclass(frozen=True, slots=True)
class CatalogTask:
    """One task of the library."""

    key: str
    names: dict[str, str]
    frequency: Frequency
    icon: str = DEFAULT_ICON
    regulatory: bool = False

    def name(self, language: str) -> str:
        """Return the name in `language`, falling back on English."""
        return localize(self.names, language, self.key)


@dataclass(frozen=True, slots=True)
class TemplateTask:
    """A library task referenced by a template, with optional overrides."""

    key: str
    overrides: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class CatalogTemplate:
    """A device template: a name and a list of tasks."""

    key: str
    names: dict[str, str]
    category: str
    icon: str
    tasks: tuple[TemplateTask, ...]

    def name(self, language: str) -> str:
        """Return the name in `language`, falling back on English."""
        return localize(self.names, language, self.key)


@dataclass(slots=True)
class Catalog:
    """The merged catalog."""

    tasks: dict[str, CatalogTask] = field(default_factory=dict)
    templates: dict[str, CatalogTemplate] = field(default_factory=dict)

    def task_frequency(self, key: str, template: str | None = None) -> Frequency:
        """Return the default frequency of a task, template overrides applied."""
        base = self.tasks[key].frequency
        tpl = self.templates.get(template) if template else None
        if tpl is None:
            return base
        for ref in tpl.tasks:
            if ref.key == key:
                return _apply_overrides(base, ref.overrides)
        return base


def localize(names: dict[str, str], language: str, default: str) -> str:
    """Pick a name for `language` ("fr", "fr-FR"…), English as fallback."""
    if not names:
        return default
    if language in names:
        return names[language]
    short = language.split("-")[0].split("_")[0]
    if short in names:
        return names[short]
    return names.get(FALLBACK_LANGUAGE) or next(iter(names.values()))


def _apply_overrides(base: Frequency, overrides: dict[str, Any]) -> Frequency:
    return Frequency(
        unit=str(overrides.get("unit", base.unit)),
        value=int(overrides.get("value", base.value)),
        anchor=overrides.get("anchor", base.anchor) or None,
    )


def _parse_task(key: str, raw: dict[str, Any]) -> CatalogTask:
    frequency = Frequency(
        unit=str(raw["unit"]),
        value=int(raw["value"]),
        anchor=raw.get("anchor") or None,
    )
    validate_frequency(frequency)
    return CatalogTask(
        key=key,
        names=dict(raw.get("name") or {}),
        frequency=frequency,
        icon=str(raw.get("icon") or DEFAULT_ICON),
        regulatory=bool(raw.get("regulatory", False)),
    )


def _parse_template(key: str, raw: dict[str, Any]) -> CatalogTemplate:
    refs: list[TemplateTask] = []
    for item in raw.get("tasks") or []:
        if isinstance(item, str):
            refs.append(TemplateTask(item))
        else:
            overrides = {k: v for k, v in item.items() if k != "key"}
            refs.append(TemplateTask(str(item["key"]), overrides))
    return CatalogTemplate(
        key=key,
        names=dict(raw.get("name") or {}),
        category=str(raw.get("category") or "other"),
        icon=str(raw.get("icon") or DEFAULT_ICON),
        tasks=tuple(refs),
    )


def merge_raw(catalog: Catalog, raw: dict[str, Any], source: str) -> None:
    """Merge a raw catalog dict into `catalog`, skipping invalid entries."""
    for key, value in (raw.get("tasks") or {}).items():
        try:
            catalog.tasks[key] = _parse_task(key, value)
        except (KeyError, TypeError, ValueError) as err:
            _LOGGER.warning("Ignoring task %s of %s: %s", key, source, err)
    for key, value in (raw.get("templates") or {}).items():
        try:
            template = _parse_template(key, value)
        except (KeyError, TypeError, ValueError) as err:
            _LOGGER.warning("Ignoring template %s of %s: %s", key, source, err)
            continue
        unknown = [ref.key for ref in template.tasks if ref.key not in catalog.tasks]
        if unknown:
            _LOGGER.warning(
                "Ignoring template %s of %s: unknown tasks %s", key, source, unknown
            )
            continue
        catalog.templates[key] = template


def load_catalog(config_dir: str | None = None) -> Catalog:
    """Load the bundled catalog, then the user one when present.

    Blocking (file I/O): run it in the executor.
    """
    catalog = Catalog()
    merge_raw(
        catalog,
        json.loads(BUNDLED_CATALOG.read_text(encoding="utf-8")),
        "bundled catalog",
    )
    if config_dir is None:
        return catalog

    user_file = Path(config_dir) / USER_CATALOG_DIR / CATALOG_FILENAME
    if user_file.is_file():
        try:
            raw = json.loads(user_file.read_text(encoding="utf-8"))
        except (OSError, ValueError) as err:
            _LOGGER.error("Cannot read user catalog %s: %s", user_file, err)
        else:
            merge_raw(catalog, raw, str(user_file))
    return catalog
