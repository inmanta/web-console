import React from "react";
import { DeployStateBar } from "./DeployStateBar";
import { colorConfig } from "./DeployStateColorConfig";

export default {
  title: "DeployStateBar",
  component: DeployStateBar,
};

export const Default = () => (
  <DeployStateBar
    summary={{
      total: 200,
      by_state: {
        unavailable: 50,
        processing_events: 10,
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
