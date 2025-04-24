import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useGetEnvironments } from "@/Data/Managers/V2/Environment";
import { DependencyContext } from "@/UI/Dependency";
import { EnvSelectorWithData } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";
import { useGetProjects } from "@/Data/Managers/V2/Project/GetProjects/useGetProjects";

/**
 * Provider component for the EnvironmentSelector
 *
 * @returns {React.FC} The Provider component
 */
export const Provider: React.FC = () => {
  const client = useQueryClient();
  const { environmentHandler, routeManager, featureManager } = useContext(DependencyContext);
  const location = useLocation();
  const navigate = useNavigate();
  const selected = environmentHandler.useSelected();

  const envDetails = true;
  const environments = useGetEnvironments().useOneTime(envDetails);
  const projects = useGetProjects().useOneTime();

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
      projects={projects}
      onSelectEnvironment={onSelectEnvironment}
      selectedEnvironment={selected}
    />
  );
};
