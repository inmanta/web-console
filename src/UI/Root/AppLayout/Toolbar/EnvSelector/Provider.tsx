import React, { useContext } from "react";
import { DependencyContext, EnvironmentHandlerContext } from "@/UI/Dependency";
import { EnvSelectorWithData } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";

export const Provider: React.FC = () => {
  const { environmentHandler } = useContext(EnvironmentHandlerContext);
  const onSelectEnvironment = (item: EnvironmentSelectorItem) => {
    environmentHandler.set(item.environmentId);
  };
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetEnvironments">({
    kind: "GetEnvironments",
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
