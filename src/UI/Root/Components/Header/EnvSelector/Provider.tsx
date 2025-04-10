import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Dropdown, MenuToggle } from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import { FlatEnvironment } from "@/Core/Domain/ProjectModel";
import { useGetEnvironments } from "@/Data/Managers/V2/Environment";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import {
  EnvironmentSelectorItem,
  EnvSelectorWrapper,
} from "./EnvSelectorWrapper";

export const Provider: React.FC = () => {
  const client = useQueryClient();
  const { environmentHandler, routeManager, featureManager } =
    useContext(DependencyContext);
  const location = useLocation();
  const navigate = useNavigate();
  const selectedEnvironment = environmentHandler.useSelected();
  const { data, isSuccess, isError, error } =
    useGetEnvironments().useContinuous();

  const onSelectEnvironment = (item: EnvironmentSelectorItem) => {
    if (selectedEnvironment) {
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

  if (isError) {
    <>
      <Dropdown
        aria-label="EnvSelector-Failed"
        toggle={() => <MenuToggle>{words("error")}</MenuToggle>}
      ></Dropdown>
      <Alert variant="danger" title={words("error")} data-testid="AlertError">
        <p>{error.message}</p>
      </Alert>
    </>;
  }
  if (isSuccess) {
    <EnvSelectorWrapper
      selectorItems={data.map(environmentToSelector)}
      environmentNames={data.map(environmentToName)}
      onSelectEnvironment={onSelectEnvironment}
      defaultToggleText={
        selectedEnvironment
          ? environmentToName(selectedEnvironment)
          : words("common.environment.select")
      }
    />;
  }

  return (
    <Dropdown toggle={() => <></>} aria-label="EnvSelector-Loading"></Dropdown>
  );
};

const environmentToSelector = ({
  id,
  project_id: projectId,
  ...environment
}: FlatEnvironment): EnvironmentSelectorItem => ({
  displayName: environmentToName(environment),
  projectId,
  environmentId: id,
});

const environmentToName = ({
  name,
  projectName,
}: Pick<FlatEnvironment, "name" | "projectName">): string =>
  `${name} (${projectName})`;
