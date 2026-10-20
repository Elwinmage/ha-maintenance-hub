# Maintenance Hub

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![Ruff](https://github.com/Elwinmage/ha-maintenance-hub/actions/workflows/main.yml/badge.svg)](https://github.com/Elwinmage/ha-maintenance-hub/actions/workflows/main.yml)
[![HA and HACS](https://github.com/Elwinmage/ha-maintenance-hub/actions/workflows/hass_and_hacs.yml/badge.svg)](https://github.com/Elwinmage/ha-maintenance-hub/actions/workflows/hass_and_hacs.yml)
![Coverage](badges/coverage.svg)

Track the recurring maintenance of your home in Home Assistant — pool, heating,
air conditioning, appliances, garden — and see it all in one card.

- **Locations → devices → tasks**: main house, holiday home, pool…; each device
  is an existing Home Assistant device or one you name yourself.
- **75 ready-made tasks and 28 device templates** (pool pump, salt chlorinator,
  pool heat pump, boiler, air conditioner, smoke detectors, irrigation…), in
  English and French.
- **Rolling or seasonal**: "every 2 weeks since last time", or "every year on
  October 15" (winterizing, boiler service…).
- **Regulatory obligations** flagged (boiler service, chimney sweeping, heat
  pump / AC service…).
- **One sensor per task**: its state is the deadline, so a plain `time`
  trigger fires on it.
- **One to-do list per location** with the tasks due soon; ticking an item
  records the maintenance.
- **The card comes with the integration**: nothing to add to your dashboard
  resources. It also shows the aquarium tasks of
  [ha-reefbeat-component](https://github.com/Elwinmage/ha-reefbeat-component),
  [ha-aquamedic-component](https://github.com/Elwinmage/ha-aquamedic-component)
  and [reef_maintenance](https://github.com/Elwinmage/ha-reef-maintenance-component).

## Installation

HACS → ⋮ → *Custom repositories* → `https://github.com/Elwinmage/ha-maintenance-hub`,
category **Integration**. Install, restart Home Assistant, then
*Settings → Devices & services → Add integration → Maintenance Hub*.

## Configuration

1. **Create a location** (one integration entry per location).
2. **Configure** the entry → *Add a device*:
   - pick an existing Home Assistant device, or type a name;
   - optionally pick a template: its tasks are preselected;
   - tick catalog tasks and/or type your own, one per field:
     `Grease the shaft` (every month) or `Grease the shaft ; 6 ; months`.
3. Adjust frequencies from the card (calendar icon on each row).

## Card

```yaml
type: custom:maintenance-hub-card
title: Maintenance          # optional
locations: []               # entry ids or names, empty = every location
include_reef: true          # also show aquarium tasks
reef_location: Aquarium     # name of the aquarium group
sort: device                # device | due
hide_ok: false
hide_muted: false
show_reset: true
show_notify: true
show_interval: true
```

Everything is available from the visual editor.

## Services

| Service | Fields |
|---|---|
| `maintenance_hub.reset` | `entity_id`, `last_reset` (optional) |
| `maintenance_hub.set_frequency` | `entity_id`, `unit` (days, weeks, months, years), `value`, `anchor` (`MM-DD`, years only, empty to clear) |
| `maintenance_hub.set_notify` | `entity_id`, `notify` |

Example, from an NFC tag stuck on the pool pump:

```yaml
action: maintenance_hub.reset
target:
  entity_id: sensor.pool_pump_clean_pump_pre_filter_basket
```

## Your own catalog

Drop a `maintenance_hub/catalog.json` file in your configuration folder, with
the same format as the bundled
[catalog.json](custom_components/maintenance_hub/catalog.json): its tasks and
templates are added to (or replace) the bundled ones.

```json
{
  "tasks": {
    "boat_antifouling": {
      "name": { "en": "Antifouling", "fr": "Antifouling" },
      "icon": "mdi:sail-boat",
      "unit": "years",
      "value": 1,
      "anchor": "03-01"
    }
  },
  "templates": {
    "boat": {
      "name": { "en": "Boat", "fr": "Bateau" },
      "category": "other",
      "icon": "mdi:sail-boat",
      "tasks": ["boat_antifouling"]
    }
  }
}
```

## Development

- Integration: `pytest` (100 % coverage), `ruff`, `pyright`.
- Card: `frontend/` (Lit + [ha-maintenance-ui](https://github.com/Elwinmage/ha-maintenance-ui)).
  `npm run build` writes the bundle into
  `custom_components/maintenance_hub/frontend/`, which is committed.
- Design: [doc/SPEC.md](doc/SPEC.md).
