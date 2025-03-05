import {
  chart_color_black_200,
  chart_color_blue_300,
  chart_color_blue_400,
  chart_color_green_100,
  chart_color_green_200,
  chart_color_orange_300,
  chart_color_purple_200,
  chart_color_red_orange_300,
  chart_color_red_orange_400,
  chart_color_teal_200,
  chart_color_teal_300,
  chart_color_teal_400,
  chart_global_danger_Color_100,
  chart_global_warning_Color_100,
  chart_theme_gray_ColorScale_300,
} from "@patternfly/react-tokens";

/**
 * Matching the colors in the color config for Resource.Status to the Patternfly color tokens.
 * This is used in the Progress bar. labelColorConfig is used in the ResourceStatus component.
   [Resource.Status.deployed]: "success",
   [Resource.Status.skipped]: "teal",
   [Resource.Status.skipped_for_undefined]: "teal",
   [Resource.Status.cancelled]: "teal",
   [Resource.Status.failed]: "danger",
   [Resource.Status.unavailable]: "warning",
   [Resource.Status.undefined]: "warning",
   [Resource.Status.deploying]: "blue",
   [Resource.Status.available]: "grey",
   [Resource.Status.dry]: "purple",
   [Resource.Status.orphaned]: "purple",
 */
export const colorTheme = {
  default: chart_color_green_200.var,
  down: chart_global_danger_Color_100.var,
  paused: chart_global_warning_Color_100.var,
  up: chart_color_green_100.var,
  deploying: chart_color_blue_400.var,
  dry: chart_color_purple_200.var,
  unavailable: chart_color_orange_300.var,
  deployed: chart_color_green_200.var,
  undefined: chart_color_orange_300.var,
  available: chart_color_black_200.var,
  skipped_for_undefined: chart_color_teal_200.var,
  skipped: chart_color_teal_300.var,
  failed: chart_color_red_orange_300.var,
  cancelled: chart_color_teal_400.var,
  danger: chart_color_red_orange_400.var,
  info: chart_color_blue_300.var,
  warning: chart_global_warning_Color_100.var,
  no_label: chart_theme_gray_ColorScale_300.var,
};
