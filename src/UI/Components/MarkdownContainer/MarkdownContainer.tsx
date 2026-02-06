/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef } from "react";
import hljs from "highlight.js";
import markdownit from "markdown-it";
import { full } from "markdown-it-emoji";
import Mermaid from "mermaid";
import { getThemePreference } from "../DarkmodeOption";
import mermaidPlugin from "./MermaidPlugin";
import setStatePlugin from "./StateTransferPlugin";
import "./styles.css";

export interface SetStateClickDetail {
  content: string;
  targetState: string;
}

/**
 * Props for the MarkdownContainer component.
 */
interface Props {
  text: string; // The Markdown content to be rendered.
  web_title: string; // The title of the web page to generate a unique Id for the mermaid elements.
  /**
   * Optional callback that is invoked when a `setState` button
   * rendered by the StateTransfer plugin is clicked.
   */
  onSetStateClick?: (detail: SetStateClickDetail) => void;
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
export const MarkdownContainer: React.FC<Props> = ({ text, web_title, onSetStateClick }) => {
  const theme = getThemePreference() || "default";
  const containerRef = useRef<HTMLDivElement>(null);
  const lastProcessedText = useRef<string>("");

  // Memoize the markdown-it instance to prevent it from changing on every render
  // This prevents the useEffect dependency array from changing unnecessarily
  const md = useMemo(() => {
    const markdownInstance = new markdownit({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
      // Enable syntax highlighting for fenced code blocks using highlight.js.
      // See: https://github.com/markdown-it/markdown-it#syntax-highlighting
      highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
          } catch {
            // fall through to default escaping
          }
        }

        // Use external default escaping
        return "";
      },
    });

    markdownInstance.use(full);
    markdownInstance.use((md) => mermaidPlugin(md, web_title, { theme }));
    markdownInstance.use((md) => setStatePlugin(md, web_title, {}));

    return markdownInstance;
  }, [web_title, theme]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // Render markdown to HTML string (includes <pre class="mermaid"> blocks)
    const result = md.render(text);

    // Only update if the text has actually changed to prevent unnecessary re-processing
    if (text !== lastProcessedText.current) {
      lastProcessedText.current = text;
      container.innerHTML = result;
    }

    const handleImageClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const diagram = target.closest(
        '.mermaid-diagram[data-zoomable="true"]'
      ) as HTMLElement | null;

      if (!diagram) return;

      event.stopPropagation();

      const isZoomed = diagram.classList.contains("zoomed");

      // Remove zoomed class from all other images
      container.querySelectorAll<HTMLElement>(".mermaid-diagram.zoomed").forEach((el) => {
        if (el !== diagram) {
          el.classList.remove("zoomed");
          const svg = el.querySelector("svg");
          if (svg) {
            svg.removeAttribute("preserveAspectRatio");
          }
        }
      });

      if (isZoomed) {
        diagram.classList.remove("zoomed");
        document.body.style.overflow = "";
        // Reset SVG preserveAspectRatio when unzooming
        const svg = diagram.querySelector("svg");
        if (svg) {
          svg.removeAttribute("preserveAspectRatio");
        }
      } else {
        diagram.classList.add("zoomed");
        document.body.style.overflow = "hidden";
        // Set preserveAspectRatio on SVG to maintain aspect ratio while scaling
        const svg = diagram.querySelector("svg");
        if (svg) {
          svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        }
      }
    };

    const handleDocumentClick = (event: Event) => {
      if (!container.contains(event.target as Node)) {
        container.querySelectorAll<HTMLElement>(".mermaid-diagram.zoomed").forEach((diagram) => {
          diagram.classList.remove("zoomed");
          const svg = diagram.querySelector("svg");
          if (svg) {
            svg.removeAttribute("preserveAspectRatio");
          }
        });
        document.body.style.overflow = "";
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        container.querySelectorAll<HTMLElement>(".mermaid-diagram.zoomed").forEach((diagram) => {
          diagram.classList.remove("zoomed");
          const svg = diagram.querySelector("svg");
          if (svg) {
            svg.removeAttribute("preserveAspectRatio");
          }
        });
        document.body.style.overflow = "";
      }
    };

    const handleStateTransferClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest(".pf-v6-c-button[data-setstate-content]") as HTMLElement | null;

      if (!button) return;

      event.stopPropagation();

      // Don't handle clicks on buttons with configuration errors
      if (button.hasAttribute("data-setstate-error")) {
        return;
      }

      const content = button.getAttribute("data-setstate-content") || "";
      const targetState = button.getAttribute("data-setstate-target") || "";

      // Notify React consumers via callback when provided.
      if (onSetStateClick) {
        onSetStateClick({ content, targetState });
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const diagram = node.matches('.mermaid-diagram[data-zoomable="true"]')
              ? node
              : (node.querySelector(
                  '.mermaid-diagram[data-zoomable="true"]'
                ) as HTMLElement | null);

            if (diagram) {
              diagram.addEventListener("click", handleImageClick);
            }

            const button = node.matches(".pf-v6-c-button[data-setstate-content]")
              ? node
              : (node.querySelector(
                  ".pf-v6-c-button[data-setstate-content]"
                ) as HTMLElement | null);

            if (button) {
              button.addEventListener("click", handleStateTransferClick);
            }
          }
        });
      });
    });

    // Start observing the container for added nodes
    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // Add initial event listeners
    container
      .querySelectorAll<HTMLElement>('.mermaid-diagram[data-zoomable="true"]')
      .forEach((diagram) => {
        diagram.addEventListener("click", handleImageClick);
      });

    container
      .querySelectorAll<HTMLElement>(".pf-v6-c-button[data-setstate-content]")
      .forEach((button) => {
        button.addEventListener("click", handleStateTransferClick);
      });

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    // Render Mermaid diagrams after the markdown HTML is in the DOM.
    // Use a timeout to ensure the innerHTML has been applied.
    const renderTimeout = setTimeout(() => {
      const mermaidBlocks = container.querySelectorAll<HTMLElement>("pre.mermaid");
      if (mermaidBlocks.length > 0) {
        const isDarkTheme = document.documentElement.classList.contains("pf-v6-theme-dark");

        (Mermaid as any).initialize({
          startOnLoad: false,
          securityLevel: "loose",
          // Switch Mermaid theme based on the current PatternFly theme.
          // This keeps diagrams readable in both light and dark modes.
          theme: isDarkTheme ? "dark" : "default",
        });

        // Helper function to display Mermaid parse errors
        const showMermaidError = (block: HTMLElement, error: any) => {
          block.classList.add("mermaid-error");
          block.classList.remove("mermaid-diagram");
          block.removeAttribute("data-zoomable");

          // Clear existing content and add error message
          block.innerHTML = "";

          // Create error message element
          const errorDiv = document.createElement("div");
          errorDiv.className = "mermaid-error-message";
          errorDiv.style.cssText =
            "padding: 1rem; margin: 1rem 0; background-color: var(--pf-t--global--color--nonstatus--red--default, #c9190b); color: var(--pf-t--global--text--color--status--danger--default, #fff); border-radius: var(--pf-t--global--border--radius--small, 4px); font-family: var(--pf-t--global--font--family--mono, monospace); font-size: 0.875rem;";
          const errorMessage =
            (error && typeof error === "object" && "message" in error
              ? String((error as { message: unknown }).message)
              : String(error)) || "Unknown error";
          errorDiv.innerHTML = `
            <strong>Error rendering Mermaid diagram:</strong><br/>
            <code>${errorMessage}</code>
          `;

          block.appendChild(errorDiv);
        };

        // Process each mermaid block individually to handle errors gracefully
        mermaidBlocks.forEach((block) => {
          // Clear any previous error state
          block.classList.remove("mermaid-error");
          const existingError = block.querySelector(".mermaid-error-message");
          if (existingError) {
            existingError.remove();
          }

          // Remove data-processed to allow re-rendering during live editing
          block.removeAttribute("data-processed");

          try {
            // In Mermaid 11+, run() is the preferred API to process specific nodes.
            if (typeof (Mermaid as any).run === "function") {
              const runPromise = (Mermaid as any).run({ nodes: [block] as any });
              // Handle async errors from run()
              if (runPromise && typeof runPromise.catch === "function") {
                runPromise.catch((error: any) => {
                  showMermaidError(block, error);
                });
              }
            } else if (typeof (Mermaid as any).init === "function") {
              // Fallback for older versions
              try {
                (Mermaid as any).init(undefined, [block] as any);
              } catch (error) {
                showMermaidError(block, error);
              }
            }

            // Mark as zoomable diagram after successful rendering
            // Use a small delay to ensure Mermaid has processed it
            setTimeout(() => {
              if (!block.classList.contains("mermaid-error")) {
                block.classList.add("mermaid-diagram");
                block.setAttribute("data-zoomable", "true");
                block.addEventListener("click", handleImageClick);
              }
            }, 100);
          } catch (error) {
            showMermaidError(block, error);
          }
        });
      }
    }, 0);

    return () => {
      clearTimeout(renderTimeout);
      observer.disconnect();
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
      container
        .querySelectorAll<HTMLElement>('.mermaid-diagram[data-zoomable="true"]')
        .forEach((diagram) => {
          diagram.removeEventListener("click", handleImageClick);
        });
      container
        .querySelectorAll<HTMLElement>(".pf-v6-c-button[data-setstate-content]")
        .forEach((button) => {
          button.removeEventListener("click", handleStateTransferClick);
        });
      document.body.style.overflow = "";
    };
  }, [text, md, onSetStateClick]);

  return <div ref={containerRef} className="markdown-body" />;
};
