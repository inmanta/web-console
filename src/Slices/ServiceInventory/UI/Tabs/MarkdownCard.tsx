import React from "react";
import { Panel } from "@patternfly/react-core";
import { MarkdownContainer, SetStateClickDetail } from "@/UI/Components/MarkdownContainer";

interface Props {
  attributeValue: unknown;
  web_title: string;
  onSetStateClick?: (detail: SetStateClickDetail) => void;
  isExpanded?: boolean;
}

/**
 * Renders a Card for displaying documentation in Markdown.
 *
 * @component
 * @param {Props} props - The component props.
 *  @prop {unknown} attributeValue - The value of the attribute.
 *  @prop {string} web_title - The title of the web page.
 *  @prop {(detail: SetStateClickDetail) => void} [onSetStateClick] - Optional handler for state transfer button clicks.
 *  @prop {boolean} isExpanded - Optional prop which is needed to work with accordions/collapsibles to show mermaid renders correctly
 * @returns {React.FC} The rendered MarkdownCard component.
 */
export const MarkdownCard: React.FC<Props> = ({
  attributeValue,
  web_title,
  onSetStateClick,
  isExpanded,
}) => {
  const data = typeof attributeValue === "string" ? attributeValue : JSON.stringify(attributeValue);

  return (
    <Panel>
      <MarkdownContainer
        text={data}
        web_title={web_title}
        onSetStateClick={onSetStateClick}
        isVisible={isExpanded}
      />
    </Panel>
  );
};
