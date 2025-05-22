import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router";
import { useGetEnvironments, useGetProjects } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { EnvSelectorWithData } from "./EnvSelectorWithData";
import { EnvironmentSelectorItem } from "./EnvSelectorWrapper";

/**
 * Provider component for the EnvironmentSelector
 *
 * @returns {React.FC} The Provider component
 */
export const Provider: React.FC = () => {
  const { environmentHandler, routeManager, featureManager } = useContext(DependencyContext);
  const location = useLocation();
  const navigate = useNavigate();
  const selected = environmentHandler.useSelected();

  const hasDetails = true;
  const environments = useGetEnvironments().useOneTime(hasDetails);
  const projects = useGetProjects().useOneTime();

  const onSelectEnvironment = (item: EnvironmentSelectorItem) => {
    if (selected) {
      environmentHandler.set(navigate, location, item.environmentId);
      return;
    }

    const newLocation = {
      ...location,
      pathname: featureManager.isLsmEnabled()
        ? routeManager.getUrl("Catalog", undefined)
        : routeManager.getUrl("CompileReports", undefined),
    };

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
