import React from "react";
import { Alert, Dropdown, Spinner, MenuToggle } from "@patternfly/react-core";
import { UseQueryResult } from "@tanstack/react-query";
import { Environment, FlatEnvironment, ProjectModel } from "@/Core";
import { EnvironmentPreview } from "@/Data/Queries";
import { words } from "@/UI/words";
import { EnvironmentSelectorItem, EnvSelectorWrapper } from "./EnvSelectorWrapper";

interface Props {
  environments: UseQueryResult<Environment[], Error>;
  projects: UseQueryResult<ProjectModel[], Error>;
  onSelectEnvironment(item: EnvironmentSelectorItem): void;
  selectedEnvironment?: EnvironmentPreview;
}

/**
 * EnvSelectorWithData component displays an environment selector dropdown.
 * It handles different states of the environment data (loading, error, success)
 * and renders the appropriate UI for each state.
 *
 * @props {Props} props - The component props
 * @prop {UseQueryResult<Environment[], Error>} environments - Query result containing environment data
 * @prop {Function} onSelectEnvironment - Callback function when an environment is selected
 * @prop {EnvironmentPreview} selectedEnvironment - Currently selected environment (if any)
 * @returns {React.FC<Props>} A dropdown component for environment selection with appropriate state handling
 */

export const EnvSelectorWithData: React.FC<Props> = ({
  environments,
  projects,
  onSelectEnvironment,
  selectedEnvironment,
}) => {
  if (environments.isError) {
    return (
      <>
        <Dropdown
          aria-label="EnvSelector-Failed"
          toggle={() => <MenuToggle>{words("error")}</MenuToggle>}
        ></Dropdown>
        <Alert variant="danger" title={words("error")} data-testid="AlertError">
          <p>{environments.error.message}</p>
        </Alert>
      </>
    );
  }

  if (projects.isError) {
    return (
      <>
        <Dropdown
          aria-label="EnvSelector-Failed"
          toggle={() => <MenuToggle>{words("error")}</MenuToggle>}
        ></Dropdown>
        <Alert variant="danger" title={words("error")} data-testid="AlertError">
          <p>{projects.error.message}</p>
        </Alert>
      </>
    );
  }

  if (environments.isSuccess && projects.isSuccess) {
    const projectMap = new Map<string, string>(
      projects.data.map((project) => [project.id, project.name])
    );
    const envsWithProjectName = environments.data.map((env) => ({
      ...env,
      projectName: projectMap.get(env.project_id) || "",
    }));

    const selectedEnvWithProjectName = envsWithProjectName.find(
      (env) => env.id === selectedEnvironment?.id
    );

    return (
      <EnvSelectorWrapper
        selectorItems={envsWithProjectName.map(environmentToSelector)}
        environmentNames={envsWithProjectName.map(environmentToName)}
        onSelectEnvironment={onSelectEnvironment}
        defaultToggleText={
          selectedEnvironment
            ? environmentToName(selectedEnvWithProjectName || selectedEnvironment)
            : words("common.environment.select")
        }
      />
    );
  }

  return (
    <Dropdown toggle={() => <Spinner size="sm" />} aria-label="EnvSelector-Loading"></Dropdown>
  );
};

/**
 * Converts a FlatEnvironment object to an EnvironmentSelectorItem object.
 *
 * @param {FlatEnvironment} environment - The FlatEnvironment object to convert
 * @returns {EnvironmentSelectorItem} The converted EnvironmentSelectorItem object
 */
const environmentToSelector = ({
  id,
  project_id: projectId,
  ...environment
}: FlatEnvironment): EnvironmentSelectorItem => ({
  displayName: environmentToName(environment),
  projectId,
  environmentId: id,
});

/**
 * Generate the name of the environment with the project name or fallback to the environment name and unknown project
 *
 * This function is to provide fallback for the scenario when there is no selected environment in the array of environments with project names,
 * as we are filtering at the end of the process of conversion
 *
 * @param {Pick<FlatEnvironment, "name" | "projectName"> | EnvironmentPreview} environment - The FlatEnvironment object to convert
 * @returns {string} The converted string representation of the environment name
 */
const environmentToName = (
  environment: Pick<FlatEnvironment, "name" | "projectName"> | EnvironmentPreview
): string => {
  if ("projectName" in environment) {
    return `${environment.name} (${environment.projectName})`;
  } else {
    return `${environment.name} (Unknown Project)`;
  }
};
