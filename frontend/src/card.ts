/**
 * maintenance-hub-card
 *
 * Lovelace card of the Maintenance Hub integration. The rendering itself is
 * the shared maintenance view of ha-maintenance-ui (same look as the
 * ha-reef-card maintenance view); this file only maps the card
 * configuration onto it and picks the backends.
 *
 *   type: custom:maintenance-hub-card
 *   title: Entretien          # optional, translated "Maintenance" otherwise
 *   locations: []             # entry ids or names, empty = every location
 *   include_reef: true        # also show reef_role tasks (aquarium)
 *   reef_location: Aquarium   # location name given to the reef tasks
 *   sort: device              # device | due
 *   hide_ok: false
 *   hide_muted: false
 *   warning_ratio: 0.2
 *   show_reset: true
 *   show_notify: true
 *   show_interval: true
 */

import { LitElement, css, html, type TemplateResult } from "lit";
import {
  define_maintenance_view,
  type HassLike,
  type MaintenanceBackend,
  type MaintenanceViewOptions,
} from "ha-maintenance-ui";

import "./editor";
import {
  card_backends,
  view_options,
  type MaintenanceHubCardConfig,
} from "./config";
import { CARD_TAG, EDITOR_TAG, VERSION } from "./const";

const VIEW_TAG = define_maintenance_view("maintenance-hub-view");

export type { MaintenanceHubCardConfig };

export class MaintenanceHubCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static override styles = css`
    ha-card {
      padding: 4px 12px;
    }
  `;

  declare hass: HassLike | null;
  declare _config: MaintenanceHubCardConfig | null;

  // Cached so the view only sees new objects when the configuration changes.
  private _options: Partial<MaintenanceViewOptions> = {};
  private _backends: MaintenanceBackend[] = [];

  constructor() {
    super();
    this.hass = null;
    this._config = null;
  }

  setConfig(config: MaintenanceHubCardConfig): void {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid configuration");
    }
    this._config = { ...config };
    this._options = view_options(this._config);
    this._backends = card_backends(this._config);
  }

  getCardSize(): number {
    return 6;
  }

  getGridOptions(): Record<string, number> {
    return { columns: 12, min_columns: 6, rows: 6 };
  }

  static getConfigElement(): HTMLElement {
    return document.createElement(EDITOR_TAG);
  }

  static getStubConfig(): MaintenanceHubCardConfig {
    return { type: `custom:${CARD_TAG}`, include_reef: true };
  }

  protected override render(): TemplateResult {
    if (!this._config) {
      return html``;
    }
    return html`
      <ha-card>
        <maintenance-hub-view
          .hass=${this.hass}
          .backends=${this._backends}
          .options=${this._options}
        ></maintenance-hub-view>
      </ha-card>
    `;
  }
}

if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, MaintenanceHubCard);
}

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_TAG)) {
  window.customCards.push({
    type: CARD_TAG,
    name: "Maintenance Hub",
    description: "Maintenance tasks of your home, pool, heating and aquarium",
    preview: true,
    documentationURL: "https://github.com/Elwinmage/ha-maintenance-hub",
  });
}

console.info(`%c MAINTENANCE-HUB-CARD %c ${VERSION} `, "color:white;background:#03a9f4", "");

// Exported for tests: the tag the view is registered under.
export { VIEW_TAG };
