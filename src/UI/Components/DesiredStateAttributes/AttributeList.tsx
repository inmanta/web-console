import React from "react";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { TextWithCopy } from "@/UI/Components/TextWithCopy";
import { CodeEditorCopyControl } from "../CodeEditorControls";
import { getThemePreference } from "../DarkmodeOption";
import { ClassifiedAttribute } from "./ClassifiedAttribute";
import { FileBlock } from "./FileBlock";

interface Props {
  attributes: ClassifiedAttribute[];
  variant?: AttributeTextVariant;
}

type AttributeTextVariant = "default" | "monospace";

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
        <DescriptionListDescription>
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
      return (
        <CodeEditor
          isReadOnly
          isDarkTheme={getThemePreference() === "dark"}
          code={attribute.value}
          isLanguageLabelVisible
          language={Language.json}
          isDownloadEnabled
          customControls={<CodeEditorCopyControl code={attribute.value} />}
          height={getHeightEditor(attribute)}
        />
      );

    case "Xml":
      return (
        <CodeEditor
          isReadOnly
          isDarkTheme={getThemePreference() === "dark"}
          code={attribute.value}
          isLanguageLabelVisible
          language={Language.xml}
          isDownloadEnabled
          customControls={<CodeEditorCopyControl code={attribute.value} />}
          height={getHeightEditor(attribute)}
        />
      );
    case "Python":
      return (
        <CodeEditor
          isReadOnly
          isDarkTheme={getThemePreference() === "dark"}
          code={attribute.value}
          isLanguageLabelVisible
          language={Language.python}
          isDownloadEnabled
          customControls={<CodeEditorCopyControl code={attribute.value} />}
          height={getHeightEditor(attribute)}
        />
      );
    case "Code":
      return (
        <CodeEditor
          isReadOnly
          isDarkTheme={getThemePreference() === "dark"}
          code={attribute.value}
          isDownloadEnabled
          customControls={<CodeEditorCopyControl code={attribute.value} />}
          height={getHeightEditor(attribute)}
        />
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

/**
 * Determines the height for code editors based on content length
 * @param attribute The attribute to determine height for
 * @returns "300px" if lines > 15, otherwise "sizeToFit"
 */
export const getHeightEditor = (attribute: ClassifiedAttribute): string => {
  if (
    attribute.kind === "Json" ||
    attribute.kind === "Xml" ||
    attribute.kind === "Python" ||
    attribute.kind === "Code"
  ) {
    const lineCount = attribute.value.split("\n").length;
    return lineCount > 15 ? "300px" : "sizeToFit";
  }
  return "sizeToFit";
};
