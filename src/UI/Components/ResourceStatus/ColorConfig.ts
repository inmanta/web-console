import { LabelProps } from "@patternfly/react-core";
import {
  global_danger_color_100,
  global_default_color_100,
  global_disabled_color_200,
  global_info_color_100,
  global_palette_purple_300,
  global_success_color_100,
  global_warning_color_100,
} from "@patternfly/react-tokens";
import { Resource } from "@/Core";

export const labelColorConfig: Record<
  Resource.Status,
  NonNullable<LabelProps["color"]>
> = {
  [Resource.Status.deployed]: "green",
  [Resource.Status.skipped]: "cyan",
  [Resource.Status.skipped_for_undefined]: "cyan",
  [Resource.Status.cancelled]: "cyan",
  [Resource.Status.failed]: "red",
  [Resource.Status.unavailable]: "orange",
  [Resource.Status.undefined]: "orange",
  [Resource.Status.deploying]: "blue",
  [Resource.Status.available]: "grey",
  [Resource.Status.dry]: "purple",
  [Resource.Status.orphaned]: "purple",
};

export const colorConfig: Record<Resource.Status, string> = {
  [Resource.Status.deployed]: global_success_color_100.var,
  [Resource.Status.skipped]: global_default_color_100.var,
  [Resource.Status.skipped_for_undefined]: global_default_color_100.var,
  [Resource.Status.cancelled]: global_default_color_100.var,
  [Resource.Status.failed]: global_danger_color_100.var,
  [Resource.Status.unavailable]: global_warning_color_100.var,
  [Resource.Status.undefined]: global_warning_color_100.var,
  [Resource.Status.deploying]: global_info_color_100.var,
  [Resource.Status.available]: global_disabled_color_200.var,
  [Resource.Status.dry]: global_palette_purple_300.var,
  [Resource.Status.orphaned]: global_palette_purple_300.var,
};
