import React from "react";
import { ResourceStatusBar } from "./Bar";
import { colorConfig } from "./ColorConfig";

export default {
  title: "Components/ResourceStatusBar",
  component: ResourceStatusBar,
};

export const Default = () => (
  <ResourceStatusBar
    summary={{
      total: 200,
      by_state: {
        unavailable: 50,
        skipped: 40,
        deployed: 5,
        failed: 15,
        deploying: 40,
        available: 2,
        cancelled: 8,
        undefined: 20,
        skipped_for_undefined: 10,
      },
    }}
    updateFilter={(updater) => alert(updater({}).status)}
  />
);

export const Legend = () =>
  Object.entries(colorConfig).map(([key, value]) => (
    <div
      key={key}
      style={{
        backgroundColor: value,
        padding: "16px",
        marginBottom: "8px",
        borderRadius: "2px",
        width: "300px",
        fontSize: "18px",
      }}
    >
      {key}
    </div>
  ));
