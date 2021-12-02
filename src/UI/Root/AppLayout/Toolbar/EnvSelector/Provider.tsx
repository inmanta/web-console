import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { DependencyContext } from "@/UI/Dependency";
import { EnvSelectorWithData } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";

export const Provider: React.FC = () => {
  const location = useLocation();
  const { environmentHandler, queryResolver } = useContext(DependencyContext);
  const onSelectEnvironment = (item: EnvironmentSelectorItem) => {
    environmentHandler.set(location, item.environmentId);
  };
  const [data] = queryResolver.useOneTime<"GetEnvironments">({
    kind: "GetEnvironments",
    details: false,
  });
  const selected = environmentHandler.useSelected();
  return (
    <EnvSelectorWithData
      environments={data}
      onSelectEnvironment={onSelectEnvironment}
      selectedEnvironment={selected}
    />
  );
};
