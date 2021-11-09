import React, { useContext } from "react";
import { FlatEnvironment } from "@/Core";
import { DescriptionList } from "@patternfly/react-core";
import { EditableTextField, EditableMultiTextField } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Project } from "./Project";
import styled from "styled-components";

interface Props {
  environment: FlatEnvironment;
}

export const EnvironmentSettings: React.FC<Props> = ({
  environment,
  ...props
}) => {
  const { commandResolver } = useContext(DependencyContext);
  const modifyEnvironmentTrigger =
    commandResolver.getTrigger<"ModifyEnvironment">({
      kind: "ModifyEnvironment",
    });

  return (
    <PaddedList aria-label={props["aria-label"]}>
      <EditableTextField
        initialValue={environment.name}
        label={words("settings.tabs.environment.name")}
        onSubmit={(name) => {
          return modifyEnvironmentTrigger({ id: environment.id, name: name });
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
            id: environment.id,
            name: environment.name,
            repository: fields["repo_url"],
            branch: fields["repo_branch"],
          });
        }}
      />
      <Project name={environment.projectName} />
    </PaddedList>
  );
};

const PaddedList = styled(DescriptionList)`
  padding-top: 1em;
`;
