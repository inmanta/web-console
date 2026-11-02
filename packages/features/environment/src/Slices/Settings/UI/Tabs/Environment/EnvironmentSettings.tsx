import React, { useContext } from "react";
import { DescriptionList } from "@patternfly/react-core";
import { FlatEnvironment, ProjectModel, words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { useModifyEnvironment } from "@inmanta/web-console-core/Queries/Slices/Environment";
import { useCreateProject } from "@inmanta/web-console-core/Queries/Slices/Project";
import {
  EditableTextField,
  EditableMultiTextField,
  EditableSelectField,
  EditableImageField,
  EditableTextAreaField,
} from "@inmanta/web-console-feature-environment/Components/InlineEditable";
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
  const { notifySuccess, notifyError } = useAppAlert();
  const { mutate } = useModifyEnvironment(environmentHandler.useId(), {
    onSuccess: () => notifySuccess({ title: words("settings.update") }),
    onError: (error) => notifyError({ title: error.message }),
  });
  const createProject = useCreateProject();

  /**
   * Shows an error of an editable field as a toast. The fields also pass `null` when they clear
   * their error, which needs no toast.
   */
  const notifyFieldError = (message: string | null): void => {
    if (message !== null) {
      notifyError({ title: message });
    }
  };

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
      notifyError({ title: `No matching project found for name '${projectName}'` });

      return;
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
      <EditableTextField
        initialValue={environment.name}
        label={words("name")}
        onSubmit={onNameSubmit}
        setError={notifyFieldError}
      />
      <EditableTextAreaField
        initialValue={environment.description || ""}
        label={words("description")}
        onSubmit={onDescriptionSubmit}
        setError={notifyFieldError}
      />
      <EditableMultiTextField
        groupName={words("settings.tabs.environment.repoSettings")}
        initialValues={{
          repo_url: environment.repo_url,
          repo_branch: environment.repo_branch,
        }}
        tooltips={{
          repo_url: words("createEnv.repository.tooltip"),
          repo_branch: words("createEnv.branch.tooltip"),
        }}
        onSubmit={onRepoSubmit}
        setError={notifyFieldError}
      />
      <EditableSelectField
        label={words("settings.tabs.environment.projectName")}
        initialValue={environment.projectName}
        options={projects.map((project) => project.name)}
        onCreate={createProject}
        onSubmit={onProjectSubmit}
        setError={notifyFieldError}
      />
      <EditableImageField
        label={words("settings.tabs.environment.icon")}
        initialValue={environment.icon || ""}
        onSubmit={onIconSubmit}
        setError={notifyFieldError}
      />
      <Actions environment={environment} />
    </DescriptionList>
  );
};
