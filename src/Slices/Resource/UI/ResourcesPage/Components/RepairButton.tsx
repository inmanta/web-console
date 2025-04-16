import React from "react";
import { DeployAction } from "@/Data/Managers/V2/Agents";
import { words } from "@/UI/words";
import { ResourcePageActionButton } from "./ActionButton";

/**
 * RepairButton component for the Resources page
 *
 * This component renders a button that triggers a full deployment (repair) action
 * for all resources. It uses the ResourcePageActionButton component to handle
 * disabled states, tooltips, and loading indicators.
 *
 * @returns {React.FC} A button component that initiates the repair action
 */
export const RepairButton: React.FC = () => {
  return (
    <ResourcePageActionButton
      method={DeployAction.repair}
      tooltip={words("resources.repair.tooltip")}
      textContent={words("resources.deploySummary.repair")}
    />
  );
};
