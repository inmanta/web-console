import React from "react";
import {
  EmptyState,
  EmptyStateIcon,
  Spinner,
  Title,
} from "@patternfly/react-core";
import { ProjectModel, RemoteData } from "@/Core";
import { words } from "@/UI/words";
import { SelectedProjectAndEnvironment } from "@/UI/Dependency";
import {
  EnvironmentSelectorItem,
  EnvSelectorWrapper,
} from "./EnvSelectorWrapper";

interface Props {
  projects: RemoteData.Type<string, ProjectModel[]>;
  onSelectEnvironment(item: EnvironmentSelectorItem): void;
  selectedProjectAndEnvironment: RemoteData.Type<
    string,
    SelectedProjectAndEnvironment
  >;
}
export const EnvSelectorWithData: React.FC<Props> = ({
  projects,
  onSelectEnvironment,
  selectedProjectAndEnvironment,
}) => {
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <EnvSelectorLoading aria-label="EnvSelector-Loading" />,
      failed: (error) => (
        <EnvSelectorError aria-label="EnvSelector-Failed" message={error} />
      ),
      success: (projects) => {
        return RemoteData.fold(
          {
            notAsked: () => null,
            loading: () => (
              <EnvSelectorLoading aria-label="EnvSelector-Loading" />
            ),
            failed: (error) => (
              <EnvSelectorError
                aria-label="EnvSelector-Failed"
                message={error}
              />
            ),
            success: (selected) => {
              const defaultToggleText = `${selected.project.name} / ${selected.environment.name}`;

              return (
                <EnvSelectorWrapper
                  projects={projects}
                  onSelectEnvironment={onSelectEnvironment}
                  defaultToggleText={defaultToggleText}
                />
              );
            },
          },
          selectedProjectAndEnvironment
        );
      },
    },
    projects
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
