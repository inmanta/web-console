import React from "react";
import { Alert, Dropdown, MenuToggle } from "@patternfly/react-core";
import { UseQueryResult } from "@tanstack/react-query";
import { Environment, FlatEnvironment } from "@/Core";
import { words } from "@/UI/words";
import { EnvironmentSelectorItem, EnvSelectorWrapper } from "./EnvSelectorWrapper";

interface Props {
  environments: UseQueryResult<Environment[], Error>;
  onSelectEnvironment(item: EnvironmentSelectorItem): void;
  selectedEnvironment?: FlatEnvironment;
}

/**
 * EnvSelectorWithData component displays an environment selector dropdown.
 * It handles different states of the environment data (loading, error, success)
 * and renders the appropriate UI for each state.
 *
 * @props {Props} props - The component props
 * @prop {UseQueryResult<Environment[], Error>} environments - Query result containing environment data
 * @prop {Function} onSelectEnvironment - Callback function when an environment is selected
 * @prop {FlatEnvironment} selectedEnvironment - Currently selected environment (if any)
 * @returns {React.FC<Props>} A dropdown component for environment selection with appropriate state handling
 */

export const EnvSelectorWithData: React.FC<Props> = ({
  environments,
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

  if (environments.isSuccess) {
    return (
      <EnvSelectorWrapper
        selectorItems={environments.data.map(environmentToSelector)}
        environmentNames={environments.data.map(environmentToName)}
        onSelectEnvironment={onSelectEnvironment}
        defaultToggleText={
          selectedEnvironment
            ? environmentToName(selectedEnvironment)
            : words("common.environment.select")
        }
      />
    );
  }

  return <Dropdown toggle={() => <></>} aria-label="EnvSelector-Loading"></Dropdown>;
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

const environmentToName = ({
  name,
  projectName,
}: Pick<FlatEnvironment, "name" | "projectName">): string => `${name} (${projectName})`;
