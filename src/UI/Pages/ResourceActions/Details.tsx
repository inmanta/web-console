import React from "react";
import { ResourceAction } from "@/Core";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";

interface Props {
  action: ResourceAction;
}

export const Details: React.FC<Props> = ({ action }) => {
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>Message</DescriptionListTerm>
        <DescriptionListDescription>
          {action.messages[0].msg}
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
            <code>{JSON.stringify(action.messages[0].kwargs, null, 2)}</code>
          </pre>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
};
