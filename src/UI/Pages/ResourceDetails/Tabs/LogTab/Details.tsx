import React from "react";
import { ResourceLog, isObjectEmpty } from "@/Core";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { CodeHighlighter, CodeText } from "@/UI/Components";
import { JsonFormatter } from "@/Data";

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
      {!isObjectEmpty(log.kwargs) && (
        <DescriptionListGroup>
          <DescriptionListTerm>kwargs</DescriptionListTerm>
          <DescriptionListDescription>
            <CodeHighlighter
              code={new JsonFormatter().format(log.kwargs)}
              language="json"
            />
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};
