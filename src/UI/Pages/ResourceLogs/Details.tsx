import React from "react";
import { ResourceLog } from "@/Core";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { CodeText } from "@/UI/Components";

interface Props {
  log: ResourceLog;
}

export const Details: React.FC<Props> = ({ log }) => {
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>Message</DescriptionListTerm>
        <DescriptionListDescription>
          <CodeText>{log.msg}</CodeText>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>kwargs</DescriptionListTerm>
        <DescriptionListDescription>
          <CodeText>{JSON.stringify(log.kwargs, null, 2)}</CodeText>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};
