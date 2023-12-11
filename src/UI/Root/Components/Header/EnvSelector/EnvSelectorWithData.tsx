import React from "react";
import { Alert, Dropdown, MenuToggle } from "@patternfly/react-core";
import { FlatEnvironment, RemoteData } from "@/Core";
import { words } from "@/UI/words";
import {
  EnvironmentSelectorItem,
  EnvSelectorWrapper,
} from "./EnvSelectorWrapper";

interface Props {
  environments: RemoteData.Type<string, FlatEnvironment[]>;
  onSelectEnvironment(item: EnvironmentSelectorItem): void;
  selectedEnvironment?: FlatEnvironment;
}
export const EnvSelectorWithData: React.FC<Props> = ({
  environments,
  onSelectEnvironment,
  selectedEnvironment,
}) =>
  RemoteData.fold(
    {
      notAsked: () => (
        <Dropdown
          toggle={() => <></>}
          aria-label="EnvSelector-NotAsked"
        ></Dropdown>
      ),
      loading: () => (
        <Dropdown
          toggle={() => <></>}
          aria-label="EnvSelector-Loading"
        ></Dropdown>
      ),
      failed: (error) => (
        <>
          <Dropdown
            aria-label="EnvSelector-Failed"
            toggle={() => <MenuToggle>{words("error")}</MenuToggle>}
          ></Dropdown>
          <Alert
            variant="danger"
            title={words("error")}
            data-testid="AlertError"
          >
            <p>{error}</p>
          </Alert>
        </>
      ),
      success: (environments) => (
        <EnvSelectorWrapper
          selectorItems={environments.map(environmentToSelector)}
          environmentNames={environments.map(environmentToName)}
          onSelectEnvironment={onSelectEnvironment}
          defaultToggleText={
            selectedEnvironment
              ? environmentToName(selectedEnvironment)
              : words("common.environment.select")
          }
        />
      ),
    },
    environments,
  );

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
