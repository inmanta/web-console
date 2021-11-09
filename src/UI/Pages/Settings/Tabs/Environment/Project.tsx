import React from "react";
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { words } from "@/UI";

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
