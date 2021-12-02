import React, { useContext } from "react";
import { DescriptionList } from "@patternfly/react-core";
import styled from "styled-components";
import { FlatEnvironment, Maybe, ProjectModel } from "@/Core";
import {
  EditableTextField,
  EditableMultiTextField,
  EditableSelectField,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  environment: FlatEnvironment;
  projects: ProjectModel[];
}

export const EnvironmentSettings: React.FC<Props> = ({
  environment,
  projects,
  ...props
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const modifyEnvironmentTrigger =
    commandResolver.getTrigger<"ModifyEnvironment">({
      kind: "ModifyEnvironment",
    });
  const createProject = commandResolver.getTrigger<"CreateProject">({
    kind: "CreateProject",
  });

  return (
    <PaddedList aria-label={props["aria-label"]}>
      <EditableTextField
        initialValue={environment.name}
        label={words("settings.tabs.environment.name")}
        onSubmit={(name) => {
          return modifyEnvironmentTrigger({ name: name });
        }}
      />
      <EditableMultiTextField
        groupName={words("settings.tabs.environment.repoSettings")}
        initialValues={{
          repo_branch: environment.repo_branch,
          repo_url: environment.repo_url,
        }}
        onSubmit={(fields) => {
          return modifyEnvironmentTrigger({
            name: environment.name,
            repository: fields["repo_url"],
            branch: fields["repo_branch"],
          });
        }}
      />
      <EditableSelectField
        label={words("settings.tabs.environment.projectName")}
        initialValue={environment.projectName}
        options={projects.map((project) => project.name)}
        onCreate={createProject}
        onSubmit={async (projectName) => {
          const match = projects.find(
            (project) => project.name === projectName
          );
          if (!match) {
            return Maybe.some(
              `No matching project found for name '${projectName}'`
            );
          }
          return modifyEnvironmentTrigger({
            name: environment.name,
            project_id: match.id,
          });
        }}
      />
    </PaddedList>
  );
};

const PaddedList = styled(DescriptionList)`
  padding-top: 1em;
`;
