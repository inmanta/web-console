import React from "react";
import styled from "styled-components";
import { CodeHighlighter } from "@/UI/Components";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { QuestionCircleIcon } from "@patternfly/react-icons";

import { ClassifiedAttribute } from "./ClassifiedAttribute";

interface Props {
  attributes: ClassifiedAttribute[];
}

export const AttributeList: React.FC<Props> = ({ attributes }) => (
  <StyledDescriptionList isHorizontal isAutoColumnWidths>
    {attributes.map((attribute) => (
      <AttributeGroup key={attribute.key} attribute={attribute} />
    ))}
  </StyledDescriptionList>
);

const AttributeGroup: React.FC<{ attribute: ClassifiedAttribute }> = ({
  attribute,
}) => {
  switch (attribute.kind) {
    case "Undefined":
      return (
        <DescriptionListGroup>
          <DescriptionListTerm>{attribute.key}</DescriptionListTerm>
          <DescriptionListDescription>
            <QuestionCircleIcon /> undefined
          </DescriptionListDescription>
        </DescriptionListGroup>
      );

    case "SingleLine":
    case "MultiLine":
    case "File":
    case "Password":
      return (
        <DescriptionListGroup>
          <DescriptionListTerm>{attribute.key}</DescriptionListTerm>
          <DescriptionListDescription>
            {attribute.value}
          </DescriptionListDescription>
        </DescriptionListGroup>
      );

    case "Json":
      return (
        <DescriptionListGroup>
          <DescriptionListTerm>{attribute.key}</DescriptionListTerm>
          <DescriptionListDescription>
            <CodeHighlighter code={attribute.value} language="json" />
          </DescriptionListDescription>
        </DescriptionListGroup>
      );

    case "Xml":
      return (
        <DescriptionListGroup>
          <DescriptionListTerm>{attribute.key}</DescriptionListTerm>
          <DescriptionListDescription>
            <CodeHighlighter code={attribute.value} language="xml" />
          </DescriptionListDescription>
        </DescriptionListGroup>
      );
  }
};

const StyledDescriptionList = styled(DescriptionList)`
  --pf-c-description-list--m-horizontal__term--width: 24ch;
`;
