import React from "react";
import { Language } from "@patternfly/react-code-editor";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { TextWithCopy } from "@/UI/Components/TextWithCopy";
import { ReadOnlyCodeEditor } from "../ReadOnlyCodeEditor";
import { ClassifiedAttribute } from "./ClassifiedAttribute";
import { FileBlock } from "./FileBlock";

interface Props {
  attributes: ClassifiedAttribute[];
  variant?: AttributeTextVariant;
}

type AttributeTextVariant = "default" | "monospace";

/** Maps a code-editor attribute kind to its highlighting language (generic `Code` has none). */
const KIND_TO_LANGUAGE: Partial<Record<ClassifiedAttribute["kind"], Language>> = {
  Json: Language.json,
  Xml: Language.xml,
};

/**
 * A component that displays a list of attributes.
 *
 * @prop {ClassifiedAttribute[]} attributes - The attributes to display.
 * @prop {AttributeTextVariant} variant - The variant of the attribute text.
 * @returns {React.FC} A component that displays a list of attributes.
 */
export const AttributeList: React.FC<Props> = ({ attributes, variant = "default" }) => (
  <DescriptionList isHorizontal>
    {attributes.map((attribute) => (
      <DescriptionListGroup key={attribute.key}>
        <DescriptionListTerm>{attribute.key}</DescriptionListTerm>
        <DescriptionListDescription data-testid={`attribute-${attribute.key}`}>
          <AttributeValue attribute={attribute} variant={variant} />
        </DescriptionListDescription>
      </DescriptionListGroup>
    ))}
  </DescriptionList>
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
      return <TextContainer $variant={variant}>{attribute.value}</TextContainer>;

    case "SingleLine":
      return (
        <TextWithCopy value={attribute.value} tooltipContent="Copy to clipboard">
          <TextContainer $variant={variant}>{attribute.value}</TextContainer>
        </TextWithCopy>
      );

    case "MultiLine":
      return (
        <MultiTextWithCopy value={attribute.value} tooltipContent="Copy to clipboard">
          <TextContainer $variant={variant}>{attribute.value}</TextContainer>
        </MultiTextWithCopy>
      );

    case "File":
      return <FileBlock hash={attribute.value} />;

    case "Json":
    case "Xml":
    case "Code":
      return (
        <ReadOnlyCodeEditor value={attribute.value} language={KIND_TO_LANGUAGE[attribute.kind]} />
      );
  }
};

const MultiTextWithCopy = styled(TextWithCopy)`
  display: block;
  max-width: 80ch;
  white-space: pre-wrap;
`;

const TextContainer = styled.span<{ $variant?: AttributeTextVariant }>`
  ${(p) =>
    p.$variant === "monospace"
      ? "font-family: var(--pf-t--global--font--family--mono)"
      : "inherit"};
`;
