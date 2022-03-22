import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import styled from "styled-components";
import { ResourceLog, isObjectEmpty } from "@/Core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier, AttributeList, CodeText } from "@/UI/Components";

interface Props {
  log: ResourceLog;
}

export const Details: React.FC<Props> = ({ log }) => {
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <StyledTerm>Message</StyledTerm>
        <DescriptionListDescription>
          <CodeText>{log.msg}</CodeText>
        </DescriptionListDescription>
      </DescriptionListGroup>
      {!isObjectEmpty(log.kwargs) && (
        <DescriptionListGroup>
          <StyledTerm>Kwargs</StyledTerm>
          <DescriptionListDescription>
            <AttributeList attributes={classifier.classify(log.kwargs)} />
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
    </DescriptionList>
  );
};

const StyledTerm = styled(DescriptionListTerm)`
  font-size: 1rem;
`;

const classifier = new AttributeClassifier(
  new JsonFormatter(),
  new XmlFormatter()
);
