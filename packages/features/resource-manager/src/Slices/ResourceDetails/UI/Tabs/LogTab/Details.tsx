import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { isObjectEmpty } from "@inmanta/web-console-core";
import { AttributeClassifier } from "@inmanta/web-console-core/Common";
import { ResourceLog } from "@inmanta/web-console-core/Domain/ResourceLog";
import { CodeText } from "@inmanta/web-console-feature-resource-manager/Components/CodeText";
import { AttributeList } from "@inmanta/web-console-ui/Components/AttributeList";

interface Props {
  log: ResourceLog;
}

const classifier = new AttributeClassifier();

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
