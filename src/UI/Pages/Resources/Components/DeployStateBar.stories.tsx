import React from "react";
import { DeployStateBar } from "./DeployStateBar";

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
