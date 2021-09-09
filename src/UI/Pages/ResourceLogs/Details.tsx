import React from "react";
import { ResourceLog } from "@/Core";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";

interface Props {
  log: ResourceLog;
}

export const Details: React.FC<Props> = ({ log }) => {
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>Message</DescriptionListTerm>
        <DescriptionListDescription>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "Liberation Mono",
            }}
          >
            <code>{log.msg}</code>
          </pre>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>kwargs</DescriptionListTerm>
        <DescriptionListDescription>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "Liberation Mono",
            }}
          >
            <code>{JSON.stringify(log.kwargs, null, 2)}</code>
          </pre>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};
