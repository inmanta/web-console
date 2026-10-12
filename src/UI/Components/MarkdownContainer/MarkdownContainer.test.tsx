import {
  t_global_border_color_nonstatus_blue_default,
  t_global_color_nonstatus_blue_default,
  t_global_text_color_nonstatus_on_blue_default,
  t_global_text_color_regular,
} from "@patternfly/react-tokens";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { words } from "@/UI/words";
import { MarkdownContainer } from "./MarkdownContainer";
import type { Mock } from "vitest";

// Mock the theme hook
vi.mock("../DarkmodeOption", () => ({
  useTheme: vi.fn(() => ({ isDark: false, theme: "light", setTheme: vi.fn() })),
}));

describe("MarkdownContainer", () => {
  afterEach(() => {
    // Drop the PatternFly token values a test set on the document root.
    document.documentElement.removeAttribute("style");
  });

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
    const mermaidMock = await import("mermaid");
    mermaidMock.default.run = vi.fn().mockImplementation(({ nodes }: { nodes: HTMLElement[] }) => {
      nodes[0].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

      return Promise.resolve();
    });

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

  it("feeds PatternFly tokens to Mermaid's base theme", async () => {
    const root = document.documentElement;
    root.style.setProperty(t_global_text_color_regular.name, "#151515");
    root.style.setProperty(t_global_color_nonstatus_blue_default.name, "#b9dafc");
    root.style.setProperty(t_global_border_color_nonstatus_blue_default.name, "#4394e5");
    root.style.setProperty(t_global_text_color_nonstatus_on_blue_default.name, "#002952");

    // Import the mermaid mock and set up spies before rendering
    const mermaidMock = await import("mermaid");
    const initializeSpy = vi.spyOn(mermaidMock.default, "initialize");
    mermaidMock.default.run = vi.fn().mockResolvedValue(undefined);

    const markdownContent = "```mermaid\ngraph LR\n    A --> B\n```";
    const webTitle = "Container_id";

    render(<MarkdownContainer text={markdownContent} web_title={webTitle} />);

    await waitFor(
      () => {
        expect(initializeSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            theme: "base",
            themeVariables: expect.objectContaining({
              textColor: "#151515",
              primaryTextColor: "#151515",
              noteTextColor: "#151515",
              // Blue is the first pie hue.
              pie1: "#b9dafc",
            }),
            themeCSS: expect.stringContaining(
              ".node.pf-blue rect, .node.pf-blue polygon, .node.pf-blue circle"
            ),
          })
        );
      },
      { timeout: 2000 }
    );

    const { themeCSS } = initializeSpy.mock.calls[initializeSpy.mock.calls.length - 1][0] as {
      themeCSS: string;
    };

    expect(themeCSS).toContain("fill: #b9dafc; stroke: #4394e5;");
    expect(themeCSS).toContain(".cluster.pf-blue .nodeLabel");
    // Hues whose tokens don't resolve are left out.
    expect(themeCSS).not.toContain("pf-green");
  });

  it("drops every token-based override when PatternFly tokens are missing", async () => {
    // PatternFly's CSS isn't loaded under jsdom, so every token reads empty
    // and only the fixed pie opacity remains.
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
        expect(initializeSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            securityLevel: "loose",
            startOnLoad: false,
            theme: "base",
            themeVariables: { pieOpacity: "1" },
            themeCSS: "",
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

  it("resolves setState button label/icon from stateTransferDefaults", async () => {
    const markdownContent = '```setState\n{"targetState":"setting_start"}\n```';
    const webTitle = "Container_id";

    render(
      <MarkdownContainer
        text={markdownContent}
        web_title={webTitle}
        stateTransferDefaults={{
          setting_start: { displayText: "Push settings", icon: "FaSlidersH", variant: "warning" },
        }}
      />
    );

    const button = await screen.findByRole("button", { name: "Push settings" });

    expect(button).toHaveAttribute("data-setstate-target", "setting_start");
    expect(button.querySelector('[data-testid="FaSlidersH"]')).toBeInTheDocument();
  });

  it("disables setState buttons and ignores clicks when disableStateTransfer is set", async () => {
    const markdownContent =
      '```setState\n{"displayText":"Apply state","targetState":"desired-state"}\n```';
    const webTitle = "Container_id";
    const handleSetStateClick = vi.fn();

    render(
      <MarkdownContainer
        text={markdownContent}
        web_title={webTitle}
        onSetStateClick={handleSetStateClick}
        disableStateTransfer
      />
    );

    const button = await screen.findByRole("button", { name: "Apply state" });

    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(handleSetStateClick).not.toHaveBeenCalled();
  });

  describe("Mermaid download toolbar", () => {
    // Minimal SVG that mermaid would normally inject into a rendered block.
    const SVG_MARKUP =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100"/></svg>';

    const MERMAID_MD = "```mermaid\ngraph LR\n  A --> B\n```";

    beforeEach(() => {
      // jsdom does not implement these Blob URL helpers, so provide stubs.
      global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
      global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it("adds SVG and PNG download buttons to a successfully rendered diagram", async () => {
      const mermaidMock = await import("mermaid");

      mermaidMock.default.run = vi
        .fn()
        .mockImplementation(({ nodes }: { nodes: HTMLElement[] }) => {
          nodes[0].innerHTML = SVG_MARKUP;

          return Promise.resolve();
        });

      render(<MarkdownContainer text={MERMAID_MD} web_title="test" />);

      await waitFor(() => expect(document.querySelector(".mermaid-toolbar")).toBeInTheDocument(), {
        timeout: 2000,
      });

      expect(screen.getByTitle(words("markdownContainer.download.svg.title"))).toBeInTheDocument();
      expect(screen.getByTitle(words("markdownContainer.download.png.title"))).toBeInTheDocument();
    });

    it("does not add duplicate toolbars when re-rendered with the same text", async () => {
      const mermaidMock = await import("mermaid");

      mermaidMock.default.run = vi
        .fn()
        .mockImplementation(({ nodes }: { nodes: HTMLElement[] }) => {
          nodes[0].innerHTML = SVG_MARKUP;

          return Promise.resolve();
        });

      const { rerender } = render(<MarkdownContainer text={MERMAID_MD} web_title="test" />);

      await waitFor(() => expect(document.querySelector(".mermaid-toolbar")).toBeInTheDocument(), {
        timeout: 2000,
      });

      rerender(<MarkdownContainer text={MERMAID_MD} web_title="test" />);

      // Give re-render time to settle, then assert exactly one toolbar.
      await waitFor(() => expect(document.querySelectorAll(".mermaid-toolbar")).toHaveLength(1), {
        timeout: 2000,
      });
    });

    it("triggers an SVG file download when the SVG button is clicked", async () => {
      const mermaidMock = await import("mermaid");

      mermaidMock.default.run = vi
        .fn()
        .mockImplementation(({ nodes }: { nodes: HTMLElement[] }) => {
          nodes[0].innerHTML = SVG_MARKUP;

          return Promise.resolve();
        });

      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

      render(<MarkdownContainer text={MERMAID_MD} web_title="test" />);

      const svgDownloadButton = await screen.findByTitle(
        words("markdownContainer.download.svg.title"),
        {},
        { timeout: 2000 }
      );

      fireEvent.click(svgDownloadButton);

      expect(URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: "image/svg+xml" })
      );

      expect(clickSpy).toHaveBeenCalled();
    });

    it("triggers a PNG file download when the PNG button is clicked", async () => {
      const mermaidMock = await import("mermaid");

      mermaidMock.default.run = vi
        .fn()
        .mockImplementation(({ nodes }: { nodes: HTMLElement[] }) => {
          nodes[0].innerHTML = SVG_MARKUP;

          return Promise.resolve();
        });

      const mockCtx = { scale: vi.fn() as Mock, drawImage: vi.fn() as Mock };
      (vi.spyOn(HTMLCanvasElement.prototype, "getContext") as Mock).mockReturnValue(mockCtx);
      vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
        "data:image/png;base64,mock"
      );
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

      // Replace Image so we can fire onload synchronously after src is set.
      // Must be a regular function (not an arrow function) because arrow functions
      // cannot be used as constructors with `new`.
      const mockImage = { onload: null as ((e: Event) => void) | null, src: "" };

      vi.stubGlobal("Image", function () {
        return mockImage;
      });

      render(<MarkdownContainer text={MERMAID_MD} web_title="test" />);

      const pngDownloadButton = await screen.findByTitle(
        words("markdownContainer.download.png.title"),
        {},
        { timeout: 2000 }
      );

      fireEvent.click(pngDownloadButton);

      // The PNG pipeline is gated on the Image load event; fire it manually.
      // src is now a data: URL (not a blob: URL) to avoid canvas taint errors.
      expect(mockImage.src).toMatch(/^data:image\/svg\+xml/);
      mockImage.onload?.(new Event("load"));

      expect(mockCtx.drawImage).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
