import React from "react";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { ClassifiedAttribute } from "@/Data";
import { TextWithCopy } from "@/UI/Components/TextWithCopy";
import { ReadOnlyCodeEditor, languageForKind } from "../ReadOnlyCodeEditor";
import { FileBlock } from "./FileBlock";

type AttributeTextVariant = "default" | "monospace";

interface Props {
  attributes: ClassifiedAttribute[];
  variant?: AttributeTextVariant;
}

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

/**
 * Renders a single classified attribute's value with the control appropriate to
 * its kind — copyable text for SingleLine, the code editor for JSON/XML/Code, a
 * file block for File, etc. Use this directly (instead of
 * {@link AttributeList}) when you need the value rendering without the
 * surrounding description-list term/label.
 */
export const AttributeValue: React.FC<{
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

    case "File":
      return <FileBlock hash={attribute.value} />;

    case "Json":
    case "Xml":
    case "Code":
      return (
        <ReadOnlyCodeEditor value={attribute.value} language={languageForKind(attribute.kind)} />
      );
  }
};

const TextContainer = styled.span<{ $variant?: AttributeTextVariant }>`
  ${(p) =>
    p.$variant === "monospace"
      ? "font-family: var(--pf-t--global--font--family--mono)"
      : "inherit"};
`;
