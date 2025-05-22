import React, { useContext, useState } from "react";
import { Alert, AlertActionCloseButton, DescriptionList } from "@patternfly/react-core";
import { FlatEnvironment, Maybe, ProjectModel } from "@/Core";
import { useModifyEnvironment } from "@/Data/Managers/V2/Environment";
import { useCreateProject } from "@/Data/Managers/V2/Project/CreateProject";
import {
  EditableTextField,
  EditableMultiTextField,
  EditableSelectField,
  EditableImageField,
  EditableTextAreaField,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Actions } from "./Components";

interface Props {
  environment: FlatEnvironment;
  projects: ProjectModel[];
}

/**
 * EnvironmentSettings component
 *
 * @props {Props} props - The component props
 * @prop {FlatEnvironment} environment - The environment to modify
 * @prop {ProjectModel[]} projects - The projects to choose from
 *
 * @returns {React.FC<Props>} - The EnvironmentSettings component
 */
export const EnvironmentSettings: React.FC<Props> = ({ environment, projects }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const { mutate } = useModifyEnvironment(environmentHandler.useId(), {
    onError: (error) => setError(error.message),
  });
  const [error, setError] = useState<string | null>(null);
  const createProject = useCreateProject();

  const onErrorClose = () => setError(null);

  const onNameSubmit = (name: string) => mutate({ name: name });

  const onRepoSubmit = (fields: Record<string, string>) =>
    mutate({
      name: environment.name,
      repository: fields["repo_url"],
      branch: fields["repo_branch"],
    });

  const onProjectSubmit = (projectName: string) => {
    const match = projects.find((project) => project.name === projectName);

    if (!match) {
      return Maybe.some(`No matching project found for name '${projectName}'`);
    }

    return mutate({
      name: environment.name,
      project_id: match.id,
    });
  };

  const onIconSubmit = (icon: string) =>
    mutate({
      name: environment.name,
      icon,
    });

  const onDescriptionSubmit = (description: string) =>
    mutate({
      name: environment.name,
      description,
    });

  return (
    <DescriptionList>
      {error && (
        <Alert
          data-testid="environment-settings-error"
          variant="danger"
          title={error}
          aria-live="polite"
          actionClose={
            <AlertActionCloseButton
              aria-label="environment-settings-error-close"
              onClose={onErrorClose}
            />
          }
          isInline
        />
      )}
      <EditableTextField
        initialValue={environment.name}
        label={words("settings.tabs.environment.name")}
        onSubmit={onNameSubmit}
        setError={setError}
      />
      <EditableTextAreaField
        initialValue={environment.description || ""}
        label={words("settings.tabs.environment.description")}
        onSubmit={onDescriptionSubmit}
        setError={setError}
      />
      <EditableMultiTextField
        groupName={words("settings.tabs.environment.repoSettings")}
        initialValues={{
          repo_branch: environment.repo_branch,
          repo_url: environment.repo_url,
        }}
        onSubmit={onRepoSubmit}
        setError={setError}
      />
      <EditableSelectField
        label={words("settings.tabs.environment.projectName")}
        initialValue={environment.projectName}
        options={projects.map((project) => project.name)}
        onCreate={createProject}
        onSubmit={onProjectSubmit}
        setError={setError}
      />
      <EditableImageField
        label={words("settings.tabs.environment.icon")}
        initialValue={environment.icon || ""}
        onSubmit={onIconSubmit}
        setError={setError}
      />
      <Actions environment={environment} />
    </DescriptionList>
  );
};
