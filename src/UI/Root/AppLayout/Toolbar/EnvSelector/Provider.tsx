import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { DependencyContext } from "@/UI/Dependency";
import { EnvSelectorWithData } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";

export const Provider: React.FC = () => {
  const { environmentHandler, queryResolver, routeManager, featureManager } =
    useContext(DependencyContext);
  const location = useLocation();
  const selected = environmentHandler.useSelected();
  const pathname = featureManager.isLsmEnabled()
    ? routeManager.getUrl("Catalog", undefined)
    : routeManager.getUrl("CompileReports", undefined);

  const [data] = queryResolver.useOneTime<"GetEnvironments">({
    kind: "GetEnvironments",
    details: false,
  });

  const onSelectEnvironment = (item: EnvironmentSelectorItem) => {
    if (!selected) {
      environmentHandler.set({ ...location, pathname }, item.environmentId);
    } else {
      environmentHandler.set(location, item.environmentId);
    }
  };

  return (
    <EnvSelectorWithData
      environments={data}
      onSelectEnvironment={onSelectEnvironment}
      selectedEnvironment={selected}
    />
  );
};
