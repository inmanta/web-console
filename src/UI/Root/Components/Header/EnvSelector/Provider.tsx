import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useGetEnvironments } from "@/Data/Managers/V2/Environment";
import { DependencyContext } from "@/UI/Dependency";
import { EnvSelectorWithData } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";

export const Provider: React.FC = () => {
  const client = useQueryClient();
  const { environmentHandler, routeManager, featureManager } = useContext(DependencyContext);
  const location = useLocation();
  const navigate = useNavigate();
  const selected = environmentHandler.useSelected();

  const environments = useGetEnvironments().useOneTime();

  const onSelectEnvironment = (item: EnvironmentSelectorItem) => {
    if (selected) {
      environmentHandler.set(navigate, location, item.environmentId);
      client.resetQueries();
      client.clear();

      return;
    }

    const newLocation = {
      ...location,
      pathname: featureManager.isLsmEnabled()
        ? routeManager.getUrl("Catalog", undefined)
        : routeManager.getUrl("CompileReports", undefined),
    };

    client.clear();
    client.resetQueries();

    environmentHandler.set(navigate, newLocation, item.environmentId);
  };

  return (
    <EnvSelectorWithData
      environments={environments}
      onSelectEnvironment={onSelectEnvironment}
      selectedEnvironment={selected}
    />
  );
};
