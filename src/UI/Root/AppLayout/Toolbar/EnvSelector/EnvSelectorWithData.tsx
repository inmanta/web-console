import React from "react";
import { Alert, ContextSelector } from "@patternfly/react-core";
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
      notAsked: () => null,
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
      success: (environments) => {
        const defaultToggleText = selectedEnvironment
          ? `${selectedEnvironment.name} (${selectedEnvironment.projectName})`
          : words("common.environment.select");

        const selectorItems = environments.map(
          ({ name, projectName, id, project_id: projectId }) => {
            const envSelectorItem: EnvironmentSelectorItem = {
              displayName: `${name} (${projectName})`,
              projectId,
              environmentId: id,
            };
            return envSelectorItem;
          }
        );
        const environmentNames = selectorItems.map((item) => item.displayName);
        return (
          <EnvSelectorWrapper
            selectorItems={selectorItems}
            environmentNames={environmentNames}
            onSelectEnvironment={onSelectEnvironment}
            defaultToggleText={defaultToggleText}
          />
        );
      },
    },
    environments
  );
