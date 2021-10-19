import { ProjectModel } from "@/Core";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import React from "react";
import { ProjectWidget } from "./ProjectWidget";

interface Props {
  projects: ProjectModel[];
}

export const Form: React.FC<Props> = ({ projects }) => {
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>Project</DescriptionListTerm>
        <DescriptionListDescription>
          <ProjectWidget projects={projects} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};
