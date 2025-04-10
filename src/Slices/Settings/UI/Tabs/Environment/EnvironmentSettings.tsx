import React from "react";
import { DescriptionList } from "@patternfly/react-core";
import { ProjectModel, Maybe, FlatEnvironment } from "@/Core";
import { useModifyEnvironment } from "@/Data/Managers/V2/Environment/ModifyEnvironment";
import { useCreateProject } from "@/Data/Managers/V2/Project/CreateProject";
import {
  EditableTextField,
  EditableMultiTextField,
  EditableSelectField,
  EditableImageField,
  EditableTextAreaField,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { Actions } from "./Components";

interface Props {
  environment: FlatEnvironment;
  projects: ProjectModel[];
}

export const EnvironmentSettings: React.FC<Props> = ({ environment, projects }) => {
  const { mutate: modifyEnvironment } = useModifyEnvironment(environment.id);
  const { mutate: createProject } = useCreateProject();

  const onNameSubmit = async (name: string) => {
    modifyEnvironment({ name });

    return Maybe.none();
  };

  const onRepoSubmit = async (fields: Record<string, string>) => {
    modifyEnvironment({
      name: environment.name,
      repository: fields["repo_url"],
      branch: fields["repo_branch"],
    });

    return Maybe.none();
  };

  const onProjectSubmit = (projectName: string): string | void => {
    const match = projects.find((project) => project.name === projectName);

    if (!match) {
      return `No matching project found for name '${projectName}'`;
    }

    modifyEnvironment({
      name: environment.name,
      project_id: match.id,
    });
  };

  const onIconSubmit = async (icon: string) => {
    modifyEnvironment({
      name: environment.name,
      icon,
    });
  };

  const onDescriptionSubmit = async (description: string) => {
    modifyEnvironment({
      name: environment.name,
      description,
    });
  };

  return (
    <DescriptionList>
      <EditableTextField
        initialValue={environment.name}
        label={words("settings.tabs.environment.name")}
        onSubmit={onNameSubmit}
      />
      <EditableTextAreaField
        initialValue={environment.description || ""}
        label={words("settings.tabs.environment.description")}
        onSubmit={onDescriptionSubmit}
      />
      <EditableMultiTextField
        groupName={words("settings.tabs.environment.repoSettings")}
        initialValues={{
          repo_branch: environment.repo_branch,
          repo_url: environment.repo_url,
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
