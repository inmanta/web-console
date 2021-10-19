import { words } from "@/UI";
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import React from "react";

interface Props {
  name: string;
}

export const Project: React.FC<Props> = ({ name }) => {
  return (
    <DescriptionListGroup>
      <DescriptionListTerm>
        {words("settings.tabs.environment.projectName")}
      </DescriptionListTerm>
      <DescriptionListDescription>{name}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};
