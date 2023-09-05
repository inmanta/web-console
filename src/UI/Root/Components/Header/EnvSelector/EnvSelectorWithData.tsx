import React from "react";
import { Alert } from "@patternfly/react-core";
import { ContextSelector } from "@patternfly/react-core/deprecated";
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
      notAsked: () => <ContextSelector aria-label="EnvSelector-NotAsked" />,
      loading: () => <ContextSelector aria-label="EnvSelector-Loading" />,
      failed: (error) => (
        <>
          <ContextSelector
            aria-label="EnvSelector-Failed"
            toggleText={words("error")}
          />
          <Alert variant="danger" title={words("error")}>
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
