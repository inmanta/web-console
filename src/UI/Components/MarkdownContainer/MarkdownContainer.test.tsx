import { render, screen, waitFor } from "@testing-library/react";
import { MarkdownContainer } from "./MarkdownContainer";

// Mock the theme function
vi.mock("../DarkmodeOption", () => ({
  getThemePreference: vi.fn(() => "default"),
}));

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

  it("renders code blocks without language specified correctly", () => {
    const markdownContent =
      "```\nsome code here\nmore code\n```\n\nThis is normal text after the code block.";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    const container = document.querySelector(".markdown-body");
    expect(container).not.toBeNull();

    // Verify the code block is rendered
    const codeBlock = container!.querySelector("pre > code");
    expect(codeBlock).not.toBeNull();
    // Check that the code block contains both lines (whitespace may be normalized in textContent)
    const codeText = codeBlock!.textContent || "";
    expect(codeText).toContain("some code here");
    expect(codeText).toContain("more code");

    // Verify that text after the code block is rendered normally (not as part of the code block)
    expect(screen.getByText("This is normal text after the code block.")).toBeInTheDocument();
  });

  it("renders the Markdown content with Mermaid diagrams correctly", async () => {
    const markdownContent = "```mermaid\ngraph LR\n    A --> B\n    B --> C\n```";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    // First, check if the mermaid placeholder container is created
    // The implementation creates placeholder divs
    const placeholderContainer = document.querySelector(".mermaid-container[data-mermaid-content]");
    expect(placeholderContainer).toBeInTheDocument();

    // Wait for the diagram to be processed and rendered
    await waitFor(() => {
      // The mock will replace the placeholder container with an img tag
      const img = screen.getByRole("img");

      expect(img).toBeInTheDocument();
      // Verify the image has the correct attributes for Mermaid diagrams
      expect(img).toHaveClass("mermaid-diagram");
      expect(img).toHaveAttribute("data-zoomable", "true");
      expect(img).toHaveAttribute("alt", "Mermaid diagram");

      // Verify the image source contains our mock SVG
      expect(img.getAttribute("src")).toContain(
        encodeURIComponent("<svg>Mock Mermaid Diagram</svg>")
      );
    });
  });

  it("applies theme configuration to Mermaid diagrams", async () => {
    // Mock theme preference to return dark theme
    const { getThemePreference } = await import("../DarkmodeOption");
    vi.mocked(getThemePreference).mockReturnValue("dark");

    // Import the mermaid mock to verify it was called with theme options
    const mermaidMock = await import("mermaid");
    const initializeSpy = vi.spyOn(mermaidMock.default, "initialize");

    const markdownContent = "```mermaid\ngraph LR\n    A --> B\n```";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    // Verify that mermaid.initialize was called with the dark theme
    expect(initializeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        securityLevel: "loose",
        startOnLoad: false,
        theme: "dark",
      })
    );

    // Check that the placeholder container is created
    const placeholderContainer = document.querySelector(".mermaid-container[data-mermaid-content]");
    expect(placeholderContainer).toBeInTheDocument();

    // Wait for the diagram to be processed
    await waitFor(() => {
      const img = screen.getByRole("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveClass("mermaid-diagram");
    });
  });

  it("uses default theme when no theme preference is set", async () => {
    // Mock theme preference to return null (no preference)
    const { getThemePreference } = await import("../DarkmodeOption");
    vi.mocked(getThemePreference).mockReturnValue(null);

    // Import the mermaid mock to verify it was called with default theme
    const mermaidMock = await import("mermaid");
    const initializeSpy = vi.spyOn(mermaidMock.default, "initialize");

    const markdownContent = "```mermaid\ngraph LR\n    A --> B\n```";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    // Verify that mermaid.initialize was called with the default theme
    expect(initializeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        securityLevel: "loose",
        startOnLoad: false,
        theme: "default",
      })
    );
  });
});
