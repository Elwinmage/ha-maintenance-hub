import { afterEach, describe, expect, it, vi } from "vitest";

import { MaintenanceHubCard, VIEW_TAG } from "../src/card";
import { card_backends, view_options } from "../src/config";
import { MaintenanceHubCardEditor } from "../src/editor";
import { CARD_TAG, EDITOR_TAG } from "../src/const";

function make_hass() {
  const hub = (entity_id: string, location_id: string, location_name: string) => ({
    entity_id,
    state: "2026-11-01T00:00:00+01:00",
    attributes: {
      maint_role: "maint_x",
      task_key: "x",
      frequency_unit: "weeks",
      frequency_value: 1,
      interval_days: 7,
      days_left: 3,
      location_id,
      location_name,
      friendly_name: "Pompe Nettoyer",
    },
  });
  return {
    language: "fr",
    callService: vi.fn(),
    states: {
      "sensor.a": hub("sensor.a", "loc1", "Maison"),
      "sensor.b": hub("sensor.b", "loc2", "Vacances"),
      "button.reef": {
        state: "unknown",
        attributes: { reef_role: "maint_glass", task_key: "glass", days_left: 2 },
      },
    },
    entities: {},
    devices: {},
  };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("config mapping", () => {
  it("maps options and backends", () => {
    expect(view_options({ type: "x", reef_location: "Bac", title: "T" })).toMatchObject({
      default_location: "Bac",
      title: "T",
    });
    expect(card_backends({ type: "x" }).map((b) => b.id)).toEqual(["hub", "reef"]);
    expect(card_backends({ type: "x", include_reef: false }).map((b) => b.id)).toEqual([
      "hub",
    ]);
  });
});

describe("card", () => {
  it("registers and renders the shared view", async () => {
    expect(customElements.get(CARD_TAG)).toBe(MaintenanceHubCard);
    expect(window.customCards!.some((c) => c.type === CARD_TAG)).toBe(true);
    const card = document.createElement(CARD_TAG) as MaintenanceHubCard;
    expect(() => card.setConfig(null as never)).toThrow();
    card.setConfig({ type: `custom:${CARD_TAG}`, include_reef: false });
    card.hass = make_hass();
    document.body.appendChild(card);
    await card.updateComplete;
    const view = card.shadowRoot!.querySelector(VIEW_TAG) as any;
    expect(view).not.toBeNull();
    expect(view.backends.map((b: any) => b.id)).toEqual(["hub"]);
    await view.updateComplete;
    expect(view.shadowRoot.querySelectorAll(".maint-location-title").length).toBe(2);
    expect(card.getCardSize()).toBe(6);
    expect(card.getGridOptions().columns).toBe(12);
  });

  it("renders nothing without configuration", async () => {
    const card = document.createElement(CARD_TAG) as MaintenanceHubCard;
    document.body.appendChild(card);
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector("ha-card")).toBeNull();
  });

  it("exposes the editor and a stub", () => {
    expect(MaintenanceHubCard.getStubConfig()).toEqual({
      type: `custom:${CARD_TAG}`,
      include_reef: true,
    });
    expect(MaintenanceHubCard.getConfigElement().tagName.toLowerCase()).toBe(EDITOR_TAG);
  });
});

describe("editor", () => {
  async function mount(config: Record<string, unknown> = {}) {
    const editor = document.createElement(EDITOR_TAG) as MaintenanceHubCardEditor;
    editor.hass = make_hass();
    editor.setConfig({ type: `custom:${CARD_TAG}`, ...config });
    const events: any[] = [];
    editor.addEventListener("config-changed", (e: Event) =>
      events.push((e as CustomEvent).detail.config),
    );
    document.body.appendChild(editor);
    await editor.updateComplete;
    return { editor, root: editor.shadowRoot!, events };
  }

  it("edits text, sort and toggles, dropping defaults", async () => {
    const { editor, root, events } = await mount({ hide_ok: true });
    const title = root.querySelector<HTMLInputElement>("#title")!;
    title.value = "Entretien";
    title.dispatchEvent(new Event("change"));
    expect(events.at(-1).title).toBe("Entretien");
    title.value = "";
    title.dispatchEvent(new Event("change"));
    expect("title" in events.at(-1)).toBe(false);

    const sort = root.querySelector<HTMLSelectElement>("#sort")!;
    sort.value = "due";
    sort.dispatchEvent(new Event("change"));
    expect(events.at(-1).sort).toBe("due");
    sort.value = "device";
    sort.dispatchEvent(new Event("change"));
    expect("sort" in events.at(-1)).toBe(false);

    const hide_ok = root.querySelector<HTMLInputElement>("#hide_ok")!;
    expect(hide_ok.checked).toBe(true);
    hide_ok.checked = false;
    hide_ok.dispatchEvent(new Event("change"));
    expect("hide_ok" in events.at(-1)).toBe(false);

    const reef = root.querySelector<HTMLInputElement>("#include_reef")!;
    reef.checked = false;
    reef.dispatchEvent(new Event("change"));
    expect(events.at(-1).include_reef).toBe(false);
    await editor.updateComplete;
    expect(root.querySelector("#reef_location")).toBeNull();
  });

  it("edits the reef location name and the location filter", async () => {
    const { editor, root, events } = await mount();
    const name = root.querySelector<HTMLInputElement>("#reef_location")!;
    name.value = "Bac récifal";
    name.dispatchEvent(new Event("change"));
    await editor.updateComplete;
    const labels = [...root.querySelectorAll(".maint-device-name")].map((n) => n.textContent);
    expect(labels).toEqual(["Bac récifal", "Maison", "Vacances"]);
    expect(root.querySelector(".maint-devices-hint")!.textContent).toContain(
      "Aucun emplacement",
    );

    const boxes = root.querySelectorAll<HTMLInputElement>(".maint-device-option input");
    boxes[1]!.checked = true;
    boxes[1]!.dispatchEvent(new Event("change"));
    expect(events.at(-1).locations).toEqual(["loc1"]);
    await editor.updateComplete;
    root.querySelectorAll<HTMLInputElement>(".maint-device-option input")[1]!.checked = false;
    root
      .querySelectorAll<HTMLInputElement>(".maint-device-option input")[1]!
      .dispatchEvent(new Event("change"));
    expect("locations" in events.at(-1)).toBe(false);

    boxes[2]!.checked = true;
    boxes[2]!.dispatchEvent(new Event("change"));
    await editor.updateComplete;
    root.querySelector<HTMLButtonElement>(".maint-devices-clear")!.click();
    expect("locations" in events.at(-1)).toBe(false);
  });

  it("shows a hint without locations and renders nothing without config", async () => {
    const editor = document.createElement(EDITOR_TAG) as MaintenanceHubCardEditor;
    document.body.appendChild(editor);
    await editor.updateComplete;
    expect(editor.shadowRoot!.querySelector("form")).toBeNull();
    editor["_update"]("title", "x");

    editor.setConfig({ type: "x", include_reef: false });
    await editor.updateComplete;
    expect(editor.shadowRoot!.querySelector(".maint-empty")!.textContent).toContain(
      "Maintenance Hub",
    );
  });
});
