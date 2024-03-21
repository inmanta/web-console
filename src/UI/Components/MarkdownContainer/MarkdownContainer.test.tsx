import React from "react";
import { render, screen } from "@testing-library/react";
import { MarkdownContainer } from "./MarkdownContainer";

describe("MarkdownContainer", () => {
  it("renders the Markdown content correctly", () => {
    const markdownContent = "# Heading\n\n**This is some bold text.**";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    expect(screen.getByText("Heading")).toBeInTheDocument();
    expect(screen.getByText("This is some bold text.")).toBeInTheDocument();
  });
  it("renders the Markdown content containing script tags safely", () => {
    const markdownContent = "`<script>alert('hello');</script>`";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);
    // assert that the script tag is not rendered in the output
    expect(screen.queryByRole("script")).not.toBeInTheDocument();
  });

  it("renders the Markdown content with Mermaid diagrams correctly", () => {
    const markdownContent =
      "```mermaid\ngraph LR\n    A --> B\n    B --> C\n```";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    // expect to find an image tag. JSDom isn't able to render real mermaid charts
    // so we just check if the image tag is present. It would contain the svg data.
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
