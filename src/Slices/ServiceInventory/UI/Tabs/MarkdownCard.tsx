import React from 'react';
import { Panel } from '@patternfly/react-core';
import { MarkdownContainer } from '@/UI/Components/MarkdownContainer';

interface Props {
  attributeValue: unknown;
  web_title: string;
}

/**
 * Renders a Card for displaying documentation in Markdown.
 *
 * @component
 * @param {Props} props - The component props.
 *  @prop {unknown} attributeValue - The value of the attribute.
 *  @prop {string} web_title - The title of the web page.
 * @returns {React.FC} The rendered MarkdownCard component.
 */
export const MarkdownCard = ({ attributeValue, web_title }: Props) => {
  const data =
    typeof attributeValue === 'string'
      ? attributeValue
      : JSON.stringify(attributeValue);

  return (
    <Panel>
      <MarkdownContainer text={data} web_title={web_title} />
    </Panel>
  );
};
