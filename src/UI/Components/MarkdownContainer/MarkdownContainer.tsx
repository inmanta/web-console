import React, { useEffect, useMemo, useRef } from "react";
import hljs from "highlight.js";
import markdownit from "markdown-it";
import { full } from "markdown-it-emoji";
import { getThemePreference } from "../DarkmodeOption";
import { renderMermaidBlocks } from "./MermaidHelpers";
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
  isVisible?: boolean;
}

/**
 * Component that renders a container for displaying Markdown content.
 * It uses the markdown-it library to parse and render the Markdown content.
 * It also supports rendering Mermaid diagrams.
 *
 * @param props - The properties of the component.
 *  @prop text - The Markdown content to be rendered.
 *  @prop web_title - The title of the tab. This is used to generate the unique Id's for the mermaid elements.
 *  @prop {boolean} isVisible - Optional prop which is needed to work with accordions/collapsibles to show mermaid renders correctly
 * @returns A React component that renders a container for displaying Markdown content.
 */
export const MarkdownContainer: React.FC<Props> = ({
  text,
  web_title,
  onSetStateClick,
  isVisible = true,
}) => {
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
    if (!isVisible) return;

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
    let cleanupMermaid: (() => void) | undefined;
    const renderTimeout = setTimeout(() => {
      cleanupMermaid = renderMermaidBlocks(container, handleImageClick);
    }, 0);

    return () => {
      clearTimeout(renderTimeout);
      cleanupMermaid?.();
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
  }, [text, md, onSetStateClick, isVisible]);

  return <div ref={containerRef} className="markdown-body" />;
};
