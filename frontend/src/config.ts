/** Card configuration and its mapping onto the shared view. */

import {
  hub_backend,
  reef_backend,
  type MaintenanceBackend,
  type MaintenanceViewOptions,
} from "ha-maintenance-ui";

export interface MaintenanceHubCardConfig {
  type: string;
  title?: string;
  locations?: string[];
  devices?: string[];
  include_reef?: boolean;
  reef_location?: string;
  sort?: "device" | "due";
  hide_ok?: boolean;
  hide_muted?: boolean;
  warning_ratio?: number;
  show_reset?: boolean;
  show_notify?: boolean;
  show_interval?: boolean;
}

/**
 * Map the card configuration onto the view options.
 * @param config: the card configuration
 * @return the view options (validated later by the view)
 */
export function view_options(
  config: MaintenanceHubCardConfig,
): Partial<MaintenanceViewOptions> {
  return {
    sort: config.sort,
    locations: config.locations,
    devices: config.devices,
    hide_ok: config.hide_ok,
    hide_muted: config.hide_muted,
    warning_ratio: config.warning_ratio,
    show_reset: config.show_reset,
    show_notify: config.show_notify,
    show_interval: config.show_interval,
    title: config.title,
    default_location: config.reef_location,
  };
}

/**
 * Backends queried by the card.
 * @param config: the card configuration
 * @return the hub backend, plus the reef one unless disabled
 */
export function card_backends(
  config: MaintenanceHubCardConfig,
): MaintenanceBackend[] {
  return config.include_reef === false
    ? [hub_backend]
    : [hub_backend, reef_backend];
}

