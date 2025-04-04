/* eslint-disable @typescript-eslint/no-explicit-any */
import MarkdownIt from "markdown-it";
import Mermaid from "mermaid";
import { words } from "@/UI";

// Define types for Mermaid API
interface MermaidAPI {
  initialize: (config: any) => void;
  render: (
    id: string,
    text: string,
  ) => Promise<{
    svg: string;
    bindFunctions?: (element: HTMLElement) => void;
  }>;
}

// Assert Mermaid as MermaidAPI
const mermaid = Mermaid as unknown as MermaidAPI;

/**
 * A plugin for markdown-it that renders Mermaid diagrams.
 *
 * @param md - The markdown-it instance to use.
 * @param baseId - The base id to use for the mermaid elements.
 * @param options - The options to use for rendering the mermaid diagrams.
 */
export default function mermaidPlugin(
  md: MarkdownIt,
  baseId: string,
  options: any,
) {
  // Setup Mermaid
  mermaid.initialize({
    securityLevel: "loose",
    ...options,
  });

  function getLangName(info: string): string {
    return info.split(/\s+/g)[0];
  }

  // Store reference to original renderer.
  const defaultFenceRenderer = md.renderer.rules.fence;

  // Render custom code types as SVGs, letting the fence parser do all the heavy lifting.
  async function customFenceRenderer(
    tokens: any[],
    idx: number,
    options: any,
    env: any,
    slf: any,
  ) {
    const token = tokens[idx];
    const info = token.info.trim();
    const langName = info ? getLangName(info) : "";

    if (["mermaid", "{mermaid}"].indexOf(langName) === -1) {
      if (defaultFenceRenderer !== undefined) {
        return defaultFenceRenderer(tokens, idx, options, env, slf);
      }

      // Missing fence renderer!
      return "";
    }

    let svgString: string = "";
    const imageAttrs: string[][] = [];

    // Create element to render into
    const element = document.createElement("div");

    document.body.appendChild(element);

    // Render with Mermaid
    try {
      const container_id = `${baseId}-${idx}`;

      // New async render API in Mermaid v10+
      const { svg, bindFunctions } = await mermaid.render(
        container_id,
        token.content,
      );

      // Extract max-width/height from the rendered SVG element
      const renderedSvg = document.getElementById(container_id);

      if (renderedSvg !== null) {
        imageAttrs.push([
          "style",
          `max-width:${renderedSvg.style.maxWidth};max-height:${renderedSvg.style.maxHeight};cursor:zoom-in;transition:transform 0.2s ease-in-out;`,
        ]);
      }

      svgString = svg;
      // Call bindFunctions if available
      bindFunctions?.(element);
    } catch (error) {
      // Create an error card svg with a red dotted border, and a title, and the error message in the body
      svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="180">
          <rect x="10" y="10" width="280" height="160" style="fill:rgb(255,255,255);stroke-width:1;stroke:rgb(255,0,0)" />
          <text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="red">${words("inventory.error.mermaid")}</text>
          <text x="50%" y="70%" alignment-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="red">${error}</text>
        </svg>
      `;
    } finally {
      element.remove();
    }

    // Store encoded image data
    imageAttrs.push([
      "src",
      `data:image/svg+xml,${encodeURIComponent(svgString)}`,
    ]);

    // Add class and data attributes for zoom functionality
    imageAttrs.push(["class", "mermaid-diagram"]);
    imageAttrs.push(["data-zoomable", "true"]);
    imageAttrs.push(["alt", "Mermaid diagram"]);

    return `<img ${slf.renderAttrs({ attrs: imageAttrs })}>`;
  }

  // Replace the fence renderer with our async version
  md.renderer.rules.fence = (...args) => {
    // We need to handle the async nature of the new renderer
    // Return a placeholder that will be replaced once rendering is complete
    const tempId = `mermaid-temp-${args[1]}`;

    customFenceRenderer(...args).then((result) => {
      const placeholder = document.getElementById(tempId);

      if (placeholder) {
        placeholder.outerHTML = result;
      }
    });

    return `<div id="${tempId}">Loading diagram...</div>`;
  };
}
