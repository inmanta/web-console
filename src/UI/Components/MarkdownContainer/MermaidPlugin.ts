/* eslint-disable @typescript-eslint/no-explicit-any */
import MarkdownIt from "markdown-it";
import Mermaid from "mermaid";

// Define types for Mermaid API
interface MermaidAPI {
  initialize: (config: any) => void;
  render: (
    id: string,
    text: string
  ) => Promise<{
    svg: string;
    bindFunctions?: (element: HTMLElement) => void;
  }>;
  parse: (text: string) => boolean;
}

// Assert Mermaid as MermaidAPI
const mermaid = Mermaid as unknown as MermaidAPI;

/**
 * A plugin for markdown-it that renders Mermaid diagrams using a two-phase approach.
 *
 * Phase 1 (Synchronous): During markdown parsing, Mermaid code blocks are converted
 * to placeholder div elements with encoded diagram content. This allows markdown-it
 * to work synchronously while preparing for async Mermaid rendering.
 *
 * Phase 2 (Asynchronous): After the markdown HTML is rendered to the DOM, the
 * processMermaidContainers() function finds placeholder divs and replaces them
 * with actual rendered Mermaid diagrams as img elements.
 *
 * @param md - The markdown-it instance to use.
 * @param baseId - The base id to use for the mermaid elements.
 * @param options - The options to use for rendering the mermaid diagrams.
 */
export default function mermaidPlugin(md: MarkdownIt, baseId: string, options: any) {
  // Setup Mermaid
  mermaid.initialize({
    securityLevel: "loose",
    startOnLoad: false, // We'll handle rendering manually
    ...options,
  });

  function getLangName(info: string): string {
    return info.split(/\s+/g)[0];
  }

  // Store reference to original renderer.
  const defaultFenceRenderer = md.renderer.rules.fence;

  // Phase 1: Synchronous fence renderer for Mermaid diagrams
  // Converts Mermaid code blocks to placeholder divs during markdown parsing
  function customFenceRenderer(
    tokens: any[],
    idx: number,
    options: any,
    env: any,
    slf: any
  ): string {
    const token = tokens[idx];
    const info = token.info.trim();
    const langName = info ? getLangName(info) : "";

    // Check if this is a mermaid code block
    if (["mermaid", "{mermaid}"].indexOf(langName) === -1) {
      // Not a mermaid block, use default fence renderer
      if (defaultFenceRenderer !== undefined) {
        return defaultFenceRenderer(tokens, idx, options, env, slf);
      }

      // Missing fence renderer!
      return "";
    }

    // Generate unique ID for this diagram
    const container_id = `${baseId}-${idx}`;

    // Return placeholder div with encoded mermaid content
    // This div will be replaced with the actual rendered diagram in Phase 2
    // We encode the content to safely store it in a data attribute
    return `<div class="mermaid-container" data-mermaid-id="${container_id}" data-mermaid-content="${encodeURIComponent(token.content)}"></div>`;
  }

  // Replace the fence renderer
  md.renderer.rules.fence = customFenceRenderer;
}

/**
 * Phase 2: Asynchronously processes Mermaid placeholder containers after DOM is rendered.
 *
 * This function is called after the markdown HTML (with placeholder divs) has been
 * inserted into the DOM. It finds all mermaid-container divs, renders the actual
 * Mermaid diagrams, and replaces the placeholders with img elements containing
 * the rendered SVG content.
 *
 * Key benefits of this approach:
 * - Allows synchronous markdown-it processing while handling async Mermaid rendering
 * - Prevents conflicts with React's virtual DOM by using direct DOM manipulation
 * - Ensures processed diagrams persist across component re-renders
 * - Provides proper error handling and fallback for invalid diagrams
 */
export async function processMermaidContainers() {
  // Find all unprocessed Mermaid placeholder containers
  const containers = document.querySelectorAll(".mermaid-container[data-mermaid-content]");

  // Process each container sequentially to avoid rendering conflicts
  for (let i = 0; i < containers.length; i++) {
    const container = containers[i];
    const id = container.getAttribute("data-mermaid-id") || "mermaid-" + Date.now();
    const content = decodeURIComponent(container.getAttribute("data-mermaid-content") || "");

    if (!content) continue;

    // Clean up any data-processed attribute to ensure fresh rendering
    // This prevents Mermaid from skipping containers it thinks are already processed
    container.removeAttribute("data-processed");

    try {
      // Render the Mermaid diagram asynchronously
      const { svg } = await (Mermaid as any).render(id, content);

      // Create img element to display the rendered SVG diagram
      // Using data URI allows the SVG to be embedded directly without external dependencies
      const img = document.createElement("img");
      img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      img.className = "mermaid-diagram";
      img.setAttribute("data-zoomable", "true");
      img.setAttribute("alt", "Mermaid diagram");
      img.style.cssText =
        "max-width:100%;max-height:auto;cursor:zoom-in;transition:transform 0.2s ease-in-out;";

      // Replace the placeholder container with the rendered diagram
      container.parentNode?.replaceChild(img, container);
    } catch (error) {
      // Create a visually clear error indicator for invalid Mermaid syntax
      const errorSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="180">
          <rect x="10" y="10" width="280" height="160" style="fill:rgb(255,255,255);stroke-width:1;stroke:rgb(255,0,0);stroke-dasharray:5,5;" />
          <text x="50%" y="40%" alignment-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="red">Mermaid Error</text>
          <text x="50%" y="60%" alignment-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="red">${String(error).substring(0, 50)}</text>
        </svg>
      `;

      // Replace the placeholder with an error diagram
      const img = document.createElement("img");
      img.src = `data:image/svg+xml,${encodeURIComponent(errorSvg)}`;
      img.className = "mermaid-diagram mermaid-error";
      img.setAttribute("alt", "Mermaid diagram error");

      container.parentNode?.replaceChild(img, container);
    }
  }
}
