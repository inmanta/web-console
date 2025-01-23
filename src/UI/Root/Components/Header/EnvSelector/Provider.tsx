import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DependencyContext } from "@/UI/Dependency";
import { EnvSelectorWithData } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";
import { useQueryClient } from "@tanstack/react-query";

export const Provider: React.FC = () => {
  const client = useQueryClient();
  const { environmentHandler, queryResolver, routeManager, featureManager } =
    useContext(DependencyContext);
  const location = useLocation();
  const navigate = useNavigate();
  const selected = environmentHandler.useSelected();
  const [data] = queryResolver.useOneTime<"GetEnvironments">({
    kind: "GetEnvironments",
    details: false,
  });

  const onSelectEnvironment = (item: EnvironmentSelectorItem) => {
    if (selected) {
      environmentHandler.set(navigate, location, item.environmentId);
      client.resetQueries();
      return;
    }
    const newLocation = {
      ...location,
      pathname: featureManager.isLsmEnabled()
        ? routeManager.getUrl("Catalog", undefined)
        : routeManager.getUrl("CompileReports", undefined),
    };
    client.resetQueries();

    environmentHandler.set(navigate, newLocation, item.environmentId);
  };

  return (
    <EnvSelectorWithData
      environments={data}
      onSelectEnvironment={onSelectEnvironment}
      selectedEnvironment={selected}
    />
  );
};
