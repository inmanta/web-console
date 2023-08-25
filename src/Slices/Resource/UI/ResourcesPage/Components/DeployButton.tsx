import React from "react";
import { words } from "@/UI/words";
import { ResourcePageActionButton } from "./ActionButton";

export const DeployButton: React.FC = () => {
  return (
    <ResourcePageActionButton
      kind="Deploy"
      tooltip={words("resources.deploy.tooltip")}
      textContent={words("resources.deploySummary.deploy")}
    />
  );
};
