import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
    // Import mermaid mock and set up run method
    const mermaidMock = await import("mermaid");
    mermaidMock.default.run = vi.fn().mockResolvedValue(undefined);

    const markdownContent = "```mermaid\ngraph LR\n    A --> B\n    B --> C\n```";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    // First, check if the mermaid pre block is created
    // The implementation creates <pre class="mermaid"> blocks
    await waitFor(() => {
      const mermaidBlock = document.querySelector("pre.mermaid");
      expect(mermaidBlock).toBeInTheDocument();
    });

    // Wait for the diagram to be processed and rendered
    await waitFor(
      () => {
        const mermaidBlock = document.querySelector("pre.mermaid.mermaid-diagram");
        expect(mermaidBlock).toBeInTheDocument();
        expect(mermaidBlock).toHaveAttribute("data-zoomable", "true");
      },
      { timeout: 2000 }
    );
  });

  it("applies theme configuration to Mermaid diagrams", async () => {
    // Set up dark theme in DOM (the implementation checks document.documentElement.classList)
    document.documentElement.classList.add("pf-v6-theme-dark");

    // Import the mermaid mock and set up spies before rendering
    const mermaidMock = await import("mermaid");
    const initializeSpy = vi.spyOn(mermaidMock.default, "initialize");
    mermaidMock.default.run = vi.fn().mockResolvedValue(undefined);

    const markdownContent = "```mermaid\ngraph LR\n    A --> B\n```";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    // Wait for the async setTimeout to execute and initialize to be called
    await waitFor(
      () => {
        // Verify that mermaid.initialize was called with the dark theme
        expect(initializeSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            securityLevel: "loose",
            startOnLoad: false,
            theme: "dark",
          })
        );
      },
      { timeout: 2000 }
    );

    // Check that the mermaid block is created
    await waitFor(() => {
      const mermaidBlock = document.querySelector("pre.mermaid");
      expect(mermaidBlock).toBeInTheDocument();
    });

    // Clean up
    document.documentElement.classList.remove("pf-v6-theme-dark");
  });

  it("uses default theme when no theme preference is set", async () => {
    // Ensure dark theme class is not present (the implementation checks document.documentElement.classList)
    document.documentElement.classList.remove("pf-v6-theme-dark");

    // Import the mermaid mock and set up spies before rendering
    const mermaidMock = await import("mermaid");
    const initializeSpy = vi.spyOn(mermaidMock.default, "initialize");
    mermaidMock.default.run = vi.fn().mockResolvedValue(undefined);

    const markdownContent = "```mermaid\ngraph LR\n    A --> B\n```";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    // Wait for the async setTimeout to execute and initialize to be called
    await waitFor(
      () => {
        // Verify that mermaid.initialize was called with the default theme
        expect(initializeSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            securityLevel: "loose",
            startOnLoad: false,
            theme: "default",
          })
        );
      },
      { timeout: 2000 }
    );
  });

  it("invokes onSetStateClick when a state transfer button is clicked", async () => {
    const markdownContent =
      '```setState\n{"displayText":"Apply state","targetState":"desired-state"}\n```';
    const webTitle = "Container_id";
    const handleSetStateClick = vi.fn();

    render(
      <MarkdownContainer
        text={markdownContent}
        web_title={webTitle}
        onSetStateClick={handleSetStateClick}
      />
    );

    const button = await screen.findByRole("button", { name: "Apply state" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleSetStateClick).toHaveBeenCalledWith({
        content: '{"displayText":"Apply state","targetState":"desired-state"}',
        targetState: "desired-state",
      });
    });
  });
});
