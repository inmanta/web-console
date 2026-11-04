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
    onError: (error) =>
      notifyError({ title: words("settings.update.failed"), message: error.message }),
  });
  const createProject = useCreateProject();

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
      notifyError({
        title: words("settings.update.failed"),
        message: words("settings.tabs.environment.projectNotFound")(projectName),
      });

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
      />
      <EditableTextAreaField
        initialValue={environment.description || ""}
        label={words("description")}
        onSubmit={onDescriptionSubmit}
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
      />
      <EditableSelectField
        label={words("settings.tabs.environment.projectName")}
        initialValue={environment.projectName}
        options={projects.map((project) => project.name)}
        onCreate={createProject}
        onSubmit={onProjectSubmit}
      />
      <EditableImageField
        label={words("settings.tabs.environment.icon")}
        initialValue={environment.icon || ""}
        onSubmit={onIconSubmit}
      />
      <Actions environment={environment} />
    </DescriptionList>
  );
};
