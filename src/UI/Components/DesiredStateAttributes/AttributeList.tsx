import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { CodeHighlighter } from "@/UI/Components/CodeHighlighter";
import { TextWithCopy } from "@/UI/Components/TextWithCopy";
import { ClassifiedAttribute } from "./ClassifiedAttribute";
import { FileBlock } from "./FileBlock";

interface Props {
  attributes: ClassifiedAttribute[];
  variant?: AttributeTextVariant;
}

type AttributeTextVariant = "default" | "monospace";

export const AttributeList: React.FC<Props> = ({
  attributes,
  variant = "default",
}) => (
  <StyledDescriptionList isHorizontal isAutoColumnWidths>
    {attributes.map((attribute) => (
      <DescriptionListGroup key={attribute.key}>
        <StyledDescriptionListTerm>{attribute.key}</StyledDescriptionListTerm>
        <DescriptionListDescription>
          <AttributeValue attribute={attribute} variant={variant} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    ))}
  </StyledDescriptionList>
);

const AttributeValue: React.FC<{
  attribute: ClassifiedAttribute;
  variant?: AttributeTextVariant;
}> = ({ attribute, variant }) => {
  switch (attribute.kind) {
    case "Undefined":
      return (
        <TextContainer $variant={variant}>
          <OutlinedQuestionCircleIcon /> undefined
        </TextContainer>
      );

    case "Password":
      return (
        <TextContainer $variant={variant}>{attribute.value}</TextContainer>
      );

    case "SingleLine":
      return (
        <TextWithCopy
          value={attribute.value}
          tooltipContent="Copy to clipboard"
        >
          <TextContainer $variant={variant}>{attribute.value}</TextContainer>
        </TextWithCopy>
      );

    case "MultiLine":
      return (
        <MultiTextWithCopy
          value={attribute.value}
          tooltipContent="Copy to clipboard"
        >
          <TextContainer $variant={variant}>{attribute.value}</TextContainer>
        </MultiTextWithCopy>
      );

    case "File":
      return <FileBlock hash={attribute.value} />;

    case "Json":
      return <CodeHighlighter code={attribute.value} language="json" />;

    case "Xml":
      return <CodeHighlighter code={attribute.value} language="xml" />;
    case "Python":
      return <CodeHighlighter code={attribute.value} language="python" />;
  }
};

const StyledDescriptionList = styled(DescriptionList)`
  --pf-c-description-list--m-horizontal__term--width: 24ch;
  --pf-c-description-list--RowGap: 0.5rem;
`;

const StyledDescriptionListTerm = styled(DescriptionListTerm)`
  overflow-wrap: anywhere;
`;

const MultiTextWithCopy = styled(TextWithCopy)`
  display: block;
  max-width: 80ch;
  white-space: pre-wrap;
`;

const TextContainer = styled.span<{ $variant?: AttributeTextVariant }>`
  ${(p) => (p.$variant === "monospace" ? "font-family: monospace;" : "")};
`;
