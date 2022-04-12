import React from "react";
import { Spacer } from "@/UI/Components";
import { colorConfig } from "@/UI/Components/ResourceStatus";
import { LegendBar } from "./LegendBar";
import { LegendItemDetails } from ".";

export default {
  title: "Components/LegendBar",
  component: LegendBar,
};

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
    label: "available",
    value: 54,
    backgroundColor: colorConfig["available"],
    color: "black",
  },
];

export const Default = () => (
  <>
    <p>Primary:</p>
    <LegendBar
      items={items}
      total={{ label: "hello", format: (total) => `? / ${total}` }}
    />
    <Spacer />
    <p>No total:</p>
    <LegendBar items={items} />
    <Spacer />
    <p>Zero:</p>
    <LegendBar items={[]} label="No items" />
    <Spacer />
    <p>One:</p>
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
    <Spacer />
    <p>Equal:</p>
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
  </>
);
