import React from "react";
import { DeployAgentsAction } from "@/Data/Queries";
import { words } from "@/UI/words";
import { ResourcePageActionButton } from "./ActionButton";

/**
 * DeployButton component for the Resources page
 *
 * This component renders a button that triggers an incremental deployment action
 * for all resources. It uses the ResourcePageActionButton component to handle
 * disabled states, tooltips, and loading indicators.
 *
 * @returns {React.FC} A button component that initiates the deploy action
 */
export const DeployButton: React.FC = () => {
  return (
    <ResourcePageActionButton
      method={DeployAgentsAction.deploy}
      tooltip={words("resources.deploy.tooltip")}
      textContent={words("resources.deploySummary.deploy")}
    />
  );
};
