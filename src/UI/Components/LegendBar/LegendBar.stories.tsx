import React from "react";
import {
  global_danger_color_100,
  global_palette_black_400,
  global_palette_cyan_200,
  global_primary_color_100,
  global_success_color_100,
  global_warning_color_100,
} from "@patternfly/react-tokens";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { LegendBar } from "./LegendBar";
import { LegendItemDetails } from ".";

export default {
  title: "LegendBar",
  component: LegendBar,
} as ComponentMeta<typeof LegendBar>;

const items: LegendItemDetails[] = [
  {
    id: "deployed",
    value: 1,
    backgroundColor: global_success_color_100.value,
    label: "deployed",
    onClick: (id) => alert(id),
  },
  {
    id: "skipped",
    value: 10,
    backgroundColor: global_palette_cyan_200.value,
    color: "black",
    label: "skipped & skipped_for_undefined & cancelled",
    onClick: (id) => alert(id),
  },
  {
    id: "failed",
    value: 100,
    backgroundColor: global_danger_color_100.value,
    label: "failed",
  },
  {
    id: "unavailable",
    value: 23,
    label: "unavailable & undefined",
    backgroundColor: global_warning_color_100.value,
    color: "black",
  },
  {
    id: "deploying",
    label: "deploying",
    value: 2000,
    backgroundColor: global_primary_color_100.value,
    onClick: (id) => alert(id),
  },
  {
    id: "available",
    label: "available & processing_events",
    value: 54,
    backgroundColor: global_palette_black_400.value,
    color: "black",
  },
];

export const Primary: ComponentStory<typeof LegendBar> = () => (
  <LegendBar
    items={items}
    total={{ label: "hello", format: (total) => `? / ${total}` }}
  />
);

export const NoTotal: ComponentStory<typeof LegendBar> = () => (
  <LegendBar items={items} />
);

export const One: ComponentStory<typeof LegendBar> = () => (
  <LegendBar
    items={[
      {
        id: "deployed",
        value: 1,
        backgroundColor: global_success_color_100.value,
        label: "deployed",
      },
    ]}
  />
);

export const Equal: ComponentStory<typeof LegendBar> = () => (
  <LegendBar
    items={[
      {
        id: "deployed",
        value: 2,
        backgroundColor: global_success_color_100.value,
        label: "deployed",
      },
      {
        id: "skipped",
        value: 2,
        backgroundColor: global_palette_cyan_200.value,
        color: "black",
        label: "skipped & skipped_for_undefined & cancelled",
      },
      {
        id: "failed",
        value: 100,
        backgroundColor: global_danger_color_100.value,
        label: "failed",
      },
    ]}
  />
);
