import {
  chart_color_gold_300,
  chart_color_green_300,
  chart_color_red_300,
} from "@patternfly/react-tokens";

export const colorTheme = {
  default: chart_color_green_300.var,
  down: chart_color_red_300.var,
  paused: chart_color_gold_300.var,
  up: chart_color_green_300.var,
};
