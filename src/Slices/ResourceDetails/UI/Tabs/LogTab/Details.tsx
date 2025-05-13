import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { isObjectEmpty } from "@/Core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier, AttributeList, CodeText } from "@/UI/Components";
import { ResourceLog } from "@S/ResourceDetails/Core/ResourceLog";

interface Props {
  log: ResourceLog;
}

/**
 * A component that displays the details of a resource log.
 *
 * @prop {ResourceLog} log - The resource log to display.
 * @returns {React.FC} A component that displays the details of a resource log.
 */
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
        <AttributeList attributes={classifier.classify(log.kwargs)} variant="monospace" />
      )}
    </DescriptionList>
  );
};

const classifier = new AttributeClassifier(
  new JsonFormatter(),
  new XmlFormatter(),
  (key: string, value: string) => ({ kind: "Code", key, value })
);
