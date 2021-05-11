import { EnvironmentHandlerContext } from "@/UI/Dependency";
import React, { useContext } from "react";
import { EnvSelectorWithData } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";

export const EnvSelectorWithProvider: React.FC = () => {
  const { environmentHandler, projects } = useContext(
    EnvironmentHandlerContext
  );
  const onSelectEnvironment = (item: EnvironmentSelectorItem) => {
    environmentHandler.set(item.projectId, item.environmentId);
  };
  const selected = environmentHandler.getSelected();
  return (
    <EnvSelectorWithData
      projects={projects}
      onSelectEnvironment={onSelectEnvironment}
      selectedProjectAndEnvironment={selected}
    />
  );
};
