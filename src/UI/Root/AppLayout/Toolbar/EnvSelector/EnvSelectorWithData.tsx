import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import {
  EmptyState,
  EmptyStateIcon,
  Spinner,
  Title,
} from "@patternfly/react-core";
import { FlatEnvironment, RemoteData } from "@/Core";
import { DependencyContext } from "@/UI";
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
}) => {
  const { routeManager } = useContext(DependencyContext);
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <EnvSelectorLoading aria-label="EnvSelector-Loading" />,
      failed: (error) => (
        <EnvSelectorError aria-label="EnvSelector-Failed" message={error} />
      ),
      success: (environments) => {
        if (selectedEnvironment) {
          const defaultToggleText = `${selectedEnvironment.name} (${selectedEnvironment.projectName})`;
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
          const environmentNames = selectorItems.map(
            (item) => item.displayName
          );
          return (
            <EnvSelectorWrapper
              selectorItems={selectorItems}
              environmentNames={environmentNames}
              onSelectEnvironment={onSelectEnvironment}
              defaultToggleText={defaultToggleText}
            />
          );
        } else {
          return <Navigate to={routeManager.getUrl("Home", undefined)} />;
        }
      },
    },
    environments
  );
};

const EnvSelectorError: React.FC<{ message: string; title?: string }> = ({
  message,
  title,
  ...props
}) => {
  return (
    <EmptyState {...props}>
      <Title headingLevel="h4" size="md">
        {title || words("error")}: {message}
      </Title>
    </EmptyState>
  );
};
const EnvSelectorLoading: React.FC = (props) => {
  return (
    <EmptyState {...props}>
      <EmptyStateIcon variant="container" component={Spinner} />
      {words("loading")}
    </EmptyState>
  );
};
