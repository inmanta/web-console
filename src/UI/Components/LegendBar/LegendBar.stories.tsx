import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { colorConfig } from "@/UI/Pages/Resources/Components";
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
    backgroundColor: colorConfig["deployed"],
    label: "deployed",
    onClick: (id) => alert(id),
  },
  {
    id: "skipped",
    value: 10,
    backgroundColor: colorConfig["skipped"],
    color: "black",
    label: "skipped & skipped_for_undefined & cancelled",
    onClick: (id) => alert(id),
  },
  {
    id: "failed",
    value: 100,
    backgroundColor: colorConfig["failed"],
    label: "failed",
  },
  {
    id: "unavailable",
    value: 23,
    label: "unavailable & undefined",
    backgroundColor: colorConfig["unavailable"],
    color: "black",
  },
  {
    id: "deploying",
    label: "deploying",
    value: 2000,
    backgroundColor: colorConfig["deploying"],
    onClick: (id) => alert(id),
  },
  {
    id: "available",
    label: "available & processing_events",
    value: 54,
    backgroundColor: colorConfig["available"],
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
        backgroundColor: colorConfig["deployed"],
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
        backgroundColor: colorConfig["deployed"],
        label: "deployed",
      },
      {
        id: "skipped",
        value: 2,
        backgroundColor: colorConfig["skipped"],
        color: "black",
        label: "skipped & skipped_for_undefined & cancelled",
      },
      {
        id: "failed",
        value: 100,
        backgroundColor: colorConfig["failed"],
        label: "failed",
      },
    ]}
  />
);
