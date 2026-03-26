import React from "react";
import { Panel } from "@patternfly/react-core";
import { MarkdownContainer } from "@/UI/Components/MarkdownContainer";

interface Props {
  attributeValue: unknown;
  web_title: string;
  isExpanded?: boolean;
}

/**
 * Renders a Card for displaying documentation in Markdown.
 *
 * @component
 * @param {Props} props - The component props.
 *  @prop {unknown} attributeValue - The value of the attribute.
 *  @prop {string} web_title - The title of the web page.
 *  @prop {boolean} isExpanded - Optional prop which is needed to work with accordions/collapsibles to show mermaid renders correctly
 * @returns {React.FC} The rendered MarkdownCard component.
 */
export const MarkdownCard: React.FC<Props> = ({ attributeValue, web_title, isExpanded }) => {
  const data = typeof attributeValue === "string" ? attributeValue : JSON.stringify(attributeValue);

  return (
    <Panel>
      <MarkdownContainer text={data} web_title={web_title} isVisible={isExpanded} />
    </Panel>
  );
};
