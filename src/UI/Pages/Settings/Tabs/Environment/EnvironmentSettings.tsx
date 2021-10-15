import React from "react";
import { EnvironmentModel, ProjectModel } from "@/Core";
import { DescriptionList } from "@patternfly/react-core";
import { EditableTextField } from "./EditableTextField";
import { EditableMultiTextField } from "./EditableMultiTextField";

interface Props {
  environment: EnvironmentModel;
  projects: ProjectModel[];
}

export const EnvironmentSettings: React.FC<Props> = ({ environment }) => {
  return (
    <>
      <DescriptionList>
        <EditableTextField
          initialValue={environment.name}
          label={"name"}
          onSubmit={(text) => console.log(text)}
        />
        <EditableMultiTextField
          groupName="Repository settings"
          fieldDescriptors={{
            repo_branch: environment.repo_branch,
            repo_url: environment.repo_url,
          }}
          onSubmit={(fields) => console.log(fields)}
        />
      </DescriptionList>
    </>
  );
};
