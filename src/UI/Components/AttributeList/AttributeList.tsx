import React from "react";
import {
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { ClassifiedAttribute } from "@/Data";
import { HoverRowGroup } from "@/UI/Components/RowHoverReveal";
import { TextWithCopy } from "@/UI/Components/TextWithCopy";
import { words } from "@/UI/words";
import { CodeEditor } from "../CodeEditor";
import { FileBlock } from "./FileBlock";
import { WithSuffix } from "./WithSuffix";
import { languageForKind } from "./helpers";

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
  <DescriptionList>
    {attributes.map((attribute) => (
      <HoverRowGroup key={attribute.key}>
        <DescriptionListTerm>{attribute.key}</DescriptionListTerm>
        <DescriptionListDescription data-testid={`attribute-${attribute.key}`}>
          <AttributeValue attribute={attribute} variant={variant} />
        </DescriptionListDescription>
      </HoverRowGroup>
    ))}
  </DescriptionList>
);

/**
 * Renders a single classified attribute's value with the control appropriate to
 * its kind: copyable text for SingleLine (a muted marker without copy when empty),
 * the code editor for JSON/XML/Code, a file block for File, etc. Use this directly (instead of
 * {@link AttributeList}) when you need the value rendering without the
 * surrounding description-list term/label.
 *
 * @prop {ClassifiedAttribute} attribute - The classified attribute to render.
 * @prop {AttributeTextVariant} [variant] - The variant of the attribute text.
 * @prop {React.ReactNode} [suffix] - Shown right after an inline value and before its copy
 *   button, such as a kind label. File and code values ignore it.
 */
export const AttributeValue: React.FC<{
  attribute: ClassifiedAttribute;
  variant?: AttributeTextVariant;
  suffix?: React.ReactNode;
}> = ({ attribute, variant, suffix }) => {
  switch (attribute.kind) {
    case "Undefined":
      return (
        <WithSuffix suffix={suffix}>
          <TextContainer $variant={variant}>
            <OutlinedQuestionCircleIcon /> undefined
          </TextContainer>
        </WithSuffix>
      );

    case "Password":
      return (
        <WithSuffix suffix={suffix}>
          <TextContainer $variant={variant}>{attribute.value}</TextContainer>
        </WithSuffix>
      );

    case "SingleLine":
      if (attribute.value === "") {
        return (
          <WithSuffix suffix={suffix}>
            <Content component="small">
              <em>{words("attributes.emptyString")}</em>
            </Content>
          </WithSuffix>
        );
      }

      return (
        <TextWithCopy value={attribute.value} tooltipContent={words("copy.clipboard")}>
          <WithSuffix suffix={suffix}>
            <TextContainer $variant={variant}>{attribute.value}</TextContainer>
          </WithSuffix>
        </TextWithCopy>
      );

    case "File":
      return <FileBlock hash={attribute.value} />;

    case "Json":
    case "Xml":
    case "Code":
      return (
        <CodeEditor
          code={attribute.value}
          language={languageForKind(attribute.kind)}
          rawValue={"rawValue" in attribute ? attribute.rawValue : undefined}
        />
      );
  }
};

const TextContainer = styled.span<{ $variant?: AttributeTextVariant }>`
  ${(p) =>
    p.$variant === "monospace"
      ? "font-family: var(--pf-t--global--font--family--mono)"
      : "inherit"};
`;
