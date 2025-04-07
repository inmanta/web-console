import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MarkdownContainer } from "./MarkdownContainer";

// Mock mermaid module
jest.mock("mermaid");

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

  it("renders the Markdown content with Mermaid diagrams correctly", async () => {
    const markdownContent =
      "```mermaid\ngraph LR\n    A --> B\n    B --> C\n```";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    // First, check if the loading placeholder is shown
    expect(screen.getByText("Loading diagram...")).toBeInTheDocument();

    // Wait for the diagram to be rendered
    await waitFor(() => {
      // The mock will replace the loading placeholder with an img tag
      const img = screen.getByRole("img");

      expect(img).toBeInTheDocument();
      // Verify the image source contains our mock SVG
      expect(img.getAttribute("src")).toContain(
        encodeURIComponent("<svg>Mock Mermaid Diagram</svg>"),
      );
    });
  });
});
