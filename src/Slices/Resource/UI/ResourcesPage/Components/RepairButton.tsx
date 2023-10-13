import React from "react";
import { words } from "@/UI/words";
import { ResourcePageActionButton } from "./ActionButton";

export const RepairButton: React.FC = () => {
  return (
    <ResourcePageActionButton
      kind="Repair"
      tooltip={words("resources.repair.tooltip")}
      textContent={words("resources.deploySummary.repair")}
    />
  );
};
