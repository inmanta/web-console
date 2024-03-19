import React from "react";
import markdownit from "markdown-it";
import mermaidPlugin from "./MermaidPlugin";

/**
 * Props for the MarkdownContainer component.
 */
interface Props {
  text: string; // The Markdown content to be rendered.
  web_title: string; // The title of the web page to generate a unique Id for the mermaid elements.
}

/**
 * Component that renders a container for displaying Markdown content.
 * It uses the markdown-it library to parse and render the Markdown content.
 * It also supports rendering Mermaid diagrams.
 *
 * @param props - The properties of the component.
 *  @prop text - The Markdown content to be rendered.
 *  @prop web_title - The title of the tab. This is used to generate the unique Id's for the mermaid elements.
 *
 * @returns A React component that renders a container for displaying Markdown content.
 */
export const MarkdownContainer = ({ text, web_title }: Props) => {
  const md = new markdownit({
    html: false,
    breaks: true,
    linkify: true,
    typographer: true,
  });
  md.use((md) => mermaidPlugin(md, web_title, {}));

  const result = md.render(text);

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: result }}
    />
  );
};
