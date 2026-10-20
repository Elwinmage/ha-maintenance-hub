/**
 * Visual editor of maintenance-hub-card.
 *
 * Plain inputs styled like the ha-reef-card maintenance editor, so the card
 * does not depend on Home Assistant's internal form elements.
 */

import { LitElement, css, html, type TemplateResult } from "lit";
import {
  assign_default_location,
  collect_all,
  language_of,
  list_maintenance_locations,
  maintenance_styles,
  t,
  type HassLike,
} from "ha-maintenance-ui";

import { card_backends, type MaintenanceHubCardConfig } from "./config";
import { EDITOR_TAG } from "./const";

type BoolKey =
  | "hide_ok"
  | "hide_muted"
  | "show_reset"
  | "show_notify"
  | "show_interval"
  | "include_reef";

/** Default value of each boolean option, as applied by the view. */
const BOOL_DEFAULTS: Record<BoolKey, boolean> = {
  hide_ok: false,
  hide_muted: false,
  show_reset: true,
  show_notify: true,
  show_interval: true,
  include_reef: true,
};

export class MaintenanceHubCardEditor extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  static override styles = [
    maintenance_styles,
    css`
      .maint-editor-form table {
        width: 100%;
      }
      .editor-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .editor-text input,
      .editor-text select {
        background: transparent;
        border: 1px solid var(--maint-divider);
        border-radius: 8px;
        color: var(--maint-text);
        font-family: inherit;
        font-size: 1em;
        padding: 6px 8px;
      }
      .editor-text select option {
        color: initial;
      }
    `,
  ];

  declare hass: HassLike | null;
  declare _config: MaintenanceHubCardConfig | null;

  constructor() {
    super();
    this.hass = null;
    this._config = null;
  }

  setConfig(config: MaintenanceHubCardConfig): void {
    this._config = { ...config };
  }

  private get _lang(): string {
    return language_of(this.hass);
  }

  private _t(key: string): string {
    return t(key, this._lang);
  }

  /** Publish a new configuration; default values are removed from it. */
  private _update(key: keyof MaintenanceHubCardConfig, value: unknown): void {
    if (!this._config) {
      return;
    }
    const next: Record<string, unknown> = { ...this._config, [key]: value };
    const is_default =
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (key in BOOL_DEFAULTS && BOOL_DEFAULTS[key as BoolKey] === value) ||
      (key === "sort" && value === "device");
    if (is_default) {
      delete next[key];
    }
    this._config = next as unknown as MaintenanceHubCardConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _bool(key: BoolKey): boolean {
    const value = this._config?.[key];
    return typeof value === "boolean" ? value : BOOL_DEFAULTS[key];
  }

  private _render_toggle(key: BoolKey, label: string): TemplateResult {
    return html`
      <tr>
        <td>
          <label class="switch">
            <input
              type="checkbox"
              id="${key}"
              .checked="${this._bool(key)}"
              @change="${(e: Event) =>
                this._update(key, (e.currentTarget as HTMLInputElement).checked)}"
            />
            <span class="slider round"></span>
          </label>
          <label for="${key}">${label}</label>
        </td>
      </tr>
    `;
  }

  private _toggle_location(id: string, checked: boolean): void {
    const current = this._config?.locations ?? [];
    const next = current.filter((value) => value !== id);
    if (checked) {
      next.push(id);
    }
    this._update("locations", next);
  }

  private _render_locations(config: MaintenanceHubCardConfig): TemplateResult {
    const items = assign_default_location(
      collect_all(card_backends(config), this.hass),
      config.reef_location || this._t("maintenance_reef_location"),
    );
    const locations = list_maintenance_locations(items);
    if (locations.length === 0) {
      return html`<div class="maint-empty">${this._t("editor_no_location")}</div>`;
    }
    const selection = config.locations ?? [];
    return html`
      <div class="maint-devices">
        ${locations.map(
          (ref) => html`
            <label class="maint-device-option">
              <input
                type="checkbox"
                .checked="${selection.includes(ref.id) ||
                selection.includes(ref.name)}"
                @change="${(e: Event) =>
                  this._toggle_location(
                    ref.id,
                    (e.currentTarget as HTMLInputElement).checked,
                  )}"
              />
              <span class="maint-device-name">${ref.name}</span>
              <span class="maint-device-count">${ref.count}</span>
            </label>
          `,
        )}
      </div>
      <div class="maint-devices-hint">
        ${selection.length === 0
          ? this._t("editor_locations_hint")
          : html`<button
              class="maint-devices-clear"
              @click="${() => this._update("locations", [])}"
            >
              ${this._t("maintenance_all_locations")}
            </button>`}
      </div>
    `;
  }

  protected override render(): TemplateResult {
    const config = this._config;
    if (!config) {
      return html``;
    }
    return html`
      <form class="maint-editor-form" @submit="${(e: Event) => e.preventDefault()}">
        <table>
          <tr>
            <td class="editor-text">
              <label for="title">${this._t("editor_title")}</label>
              <input
                id="title"
                type="text"
                .value="${config.title ?? ""}"
                placeholder="${this._t("maintenance_view")}"
                @change="${(e: Event) =>
                  this._update("title", (e.currentTarget as HTMLInputElement).value)}"
              />
            </td>
          </tr>
          <tr>
            <td class="editor-text">
              <label for="sort">${this._t("editor_sort_default")}</label>
              <select
                id="sort"
                @change="${(e: Event) =>
                  this._update("sort", (e.currentTarget as HTMLSelectElement).value)}"
              >
                <option value="device" ?selected="${config.sort !== "due"}">
                  ${this._t("sort_by_equipment")}
                </option>
                <option value="due" ?selected="${config.sort === "due"}">
                  ${this._t("sort_by_due_date")}
                </option>
              </select>
            </td>
          </tr>
          ${this._render_toggle("hide_ok", this._t("maintenance_hide_ok_default"))}
          ${this._render_toggle("hide_muted", this._t("maintenance_hide_muted_default"))}
          ${this._render_toggle("show_reset", this._t("editor_show_reset"))}
          ${this._render_toggle("show_notify", this._t("editor_show_notify"))}
          ${this._render_toggle("show_interval", this._t("editor_show_interval"))}
          ${this._render_toggle("include_reef", this._t("editor_include_reef"))}
          ${this._bool("include_reef")
            ? html`<tr>
                <td class="editor-text">
                  <label for="reef_location">${this._t("editor_reef_location")}</label>
                  <input
                    id="reef_location"
                    type="text"
                    .value="${config.reef_location ?? ""}"
                    placeholder="${this._t("maintenance_reef_location")}"
                    @change="${(e: Event) =>
                      this._update(
                        "reef_location",
                        (e.currentTarget as HTMLInputElement).value,
                      )}"
                  />
                </td>
              </tr>`
            : ""}
          <tr>
            <td>
              <label class="maint-devices-title">${this._t("editor_locations")}</label>
              ${this._render_locations(config)}
            </td>
          </tr>
        </table>
      </form>
    `;
  }
}

if (!customElements.get(EDITOR_TAG)) {
  customElements.define(EDITOR_TAG, MaintenanceHubCardEditor);
}
