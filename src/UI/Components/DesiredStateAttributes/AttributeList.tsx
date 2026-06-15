import React, { useState } from "react";
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
import { CodeEditorCopyControl, CodeEditorHeightToggleControl } from "../CodeEditorControls";
import { useTheme } from "../DarkmodeOption";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDark } = useTheme();

  const getEditorHeight = (attribute: ClassifiedAttribute) => {
    return isExpanded ? "calc(100vh - 300px)" : getDefaultHeightEditor(attribute);
  };

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
          key={`json-${isExpanded}`}
          isReadOnly
          isDarkTheme={isDark}
          code={attribute.value}
          isLanguageLabelVisible
          language={Language.json}
          isDownloadEnabled
          customControls={
            <>
              <CodeEditorCopyControl code={attribute.value} />
              <CodeEditorHeightToggleControl
                code={attribute.value}
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
              />
            </>
          }
          height={getEditorHeight(attribute)}
        />
      );

    case "Xml":
      return (
        <CodeEditor
          key={`xml-${isExpanded}`}
          isReadOnly
          isDarkTheme={isDark}
          code={attribute.value}
          isLanguageLabelVisible
          language={Language.xml}
          isDownloadEnabled
          customControls={
            <>
              <CodeEditorCopyControl code={attribute.value} />
              <CodeEditorHeightToggleControl
                code={attribute.value}
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
              />
            </>
          }
          height={getEditorHeight(attribute)}
        />
      );
    case "Python":
      return (
        <CodeEditor
          key={`python-${isExpanded}`}
          isReadOnly
          isDarkTheme={isDark}
          code={attribute.value}
          isLanguageLabelVisible
          language={Language.python}
          isDownloadEnabled
          customControls={
            <>
              <CodeEditorCopyControl code={attribute.value} />
              <CodeEditorHeightToggleControl
                code={attribute.value}
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
              />
            </>
          }
          height={getEditorHeight(attribute)}
        />
      );
    case "Code":
      return (
        <CodeEditor
          key={`code-${isExpanded}`}
          isReadOnly
          isDarkTheme={isDark}
          code={attribute.value}
          isDownloadEnabled
          customControls={
            <>
              <CodeEditorCopyControl code={attribute.value} />
              <CodeEditorHeightToggleControl
                code={attribute.value}
                isExpanded={isExpanded}
                onToggle={() => setIsExpanded(!isExpanded)}
              />
            </>
          }
          height={getEditorHeight(attribute)}
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
 * Determines the height for code editors based on content length.
 * Uses explicit px values instead of "sizeToFit" because PatternFly's sizeToFit
 * calls editor.layout() but never updates the container's CSS height, leaving
 * the container at 0px (invalid CSS value) while Monaco overflows it.
 *
 * Monaco line height: Math.round(GOLDEN_LINE_HEIGHT_RATIO * fontSize)
 *   Windows/Linux: Math.round(1.35 * 14) = 19px
 *   macOS:         Math.round(1.5  * 12) = 18px
 * Using 19px covers both platforms (slightly tall on macOS — better than too short).
 * The height prop targets the Monaco container only; the toolbar sits outside it.
 */
export const getDefaultHeightEditor = (attribute: ClassifiedAttribute): string => {
  if (
    attribute.kind === "Json" ||
    attribute.kind === "Xml" ||
    attribute.kind === "Python" ||
    attribute.kind === "Code"
  ) {
    const lineCount = attribute.value.split("\n").length;

    return `${Math.min(lineCount * 19, 300)}px`;
  }

  return "19px";
};
