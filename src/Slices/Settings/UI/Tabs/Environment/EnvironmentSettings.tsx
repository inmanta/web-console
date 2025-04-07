import React, { useContext } from 'react';
import { DescriptionList } from '@patternfly/react-core';
import { FlatEnvironment, Maybe, ProjectModel } from '@/Core';
import {
  EditableTextField,
  EditableMultiTextField,
  EditableSelectField,
  EditableImageField,
  EditableTextAreaField,
} from '@/UI/Components';
import { DependencyContext } from '@/UI/Dependency';
import { words } from '@/UI/words';
import { Actions } from './Components';

interface Props {
  environment: FlatEnvironment;
  projects: ProjectModel[];
}

export const EnvironmentSettings: React.FC<Props> = ({
  environment,
  projects,
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const modifyEnvironmentTrigger =
    commandResolver.useGetTrigger<'ModifyEnvironment'>({
      kind: 'ModifyEnvironment',
    });
  const createProject = commandResolver.useGetTrigger<'CreateProject'>({
    kind: 'CreateProject',
  });

  const onNameSubmit = (name: string) =>
    modifyEnvironmentTrigger({ name: name });

  const onRepoSubmit = (fields: Record<string, string>) =>
    modifyEnvironmentTrigger({
      name: environment.name,
      repository: fields['repo_url'],
      branch: fields['repo_branch'],
    });

  const onProjectSubmit = async (projectName: string) => {
    const match = projects.find((project) => project.name === projectName);

    if (!match) {
      return Maybe.some(`No matching project found for name '${projectName}'`);
    }

    return modifyEnvironmentTrigger({
      name: environment.name,
      project_id: match.id,
    });
  };

  const onIconSubmit = async (icon: string) =>
    modifyEnvironmentTrigger({
      name: environment.name,
      icon,
    });

  const onDescriptionSubmit = async (description: string) =>
    modifyEnvironmentTrigger({
      name: environment.name,
      description,
    });

  return (
    <DescriptionList>
      <EditableTextField
        initialValue={environment.name}
        label={words('settings.tabs.environment.name')}
        onSubmit={onNameSubmit}
      />
      <EditableTextAreaField
        initialValue={environment.description || ''}
        label={words('settings.tabs.environment.description')}
        onSubmit={onDescriptionSubmit}
      />
      <EditableMultiTextField
        groupName={words('settings.tabs.environment.repoSettings')}
        initialValues={{
          repo_branch: environment.repo_branch,
          repo_url: environment.repo_url,
        }}
        onSubmit={onRepoSubmit}
      />
      <EditableSelectField
        label={words('settings.tabs.environment.projectName')}
        initialValue={environment.projectName}
        options={projects.map((project) => project.name)}
        onCreate={createProject}
        onSubmit={onProjectSubmit}
      />
      <EditableImageField
        label={words('settings.tabs.environment.icon')}
        initialValue={environment.icon || ''}
        onSubmit={onIconSubmit}
      />
      <Actions environment={environment} />
    </DescriptionList>
  );
};
