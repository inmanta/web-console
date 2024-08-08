import React from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { MarkdownContainer } from "@/UI/Components/MarkdownContainer";

interface Props {
  attributeValue: unknown;
  web_title: string;
}

/**
 * Renders a set of tabs for displaying documentation in Markdown.
 *
 * @component
 * @param {Props} props - The component props.
 *  @prop {unknown} attributeValue - The value of the attribute.
 *  @prop {string} web_title - The title of the web page.
 * @returns {JSX.Element} The rendered DocumentationTabs component.
 */
export const DocumentationTabs = ({ attributeValue, web_title }: Props) => {
  const data =
    typeof attributeValue === "string"
      ? attributeValue
      : JSON.stringify(attributeValue);

  return (
    <Card>
      <CardBody>
        <MarkdownContainer text={data} web_title={web_title} />
      </CardBody>
    </Card>
  );
};
