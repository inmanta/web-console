/* eslint-disable @typescript-eslint/no-explicit-any */
import MarkdownIt from "markdown-it";
import Mermaid from "mermaid";
import { words } from "@/UI";

/**
 * A plugin for markdown-it that renders Mermaid diagrams.
 *
 * @Note We are using Mermaid v9.0.0 because structuredClone isn't yet available in JSDom and Jest v29.0.0
 * see : https://github.com/jsdom/jsdom/issues/3363
 * Mermaid V9.0.0 is the last version that doesn't use structuredClone.
 * It also still gets security updates as it is widely used.
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
  Mermaid.initialize({
    securityLevel: "loose",
    ...options,
  });

  function getLangName(info: string): string {
    return info.split(/\s+/g)[0];
  }

  // Store reference to original renderer.
  const defaultFenceRenderer = md.renderer.rules.fence;

  // Render custom code types as SVGs, letting the fence parser do all the heavy lifting.
  function customFenceRenderer(
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
      Mermaid.render(
        container_id,
        token.content,
        (html: string) => {
          // We need to forcibly extract the max-width/height attributes to set on img tag
          // Mermaid will render the svg in the container_id.
          const svg = document.getElementById(container_id);
          if (svg !== null) {
            imageAttrs.push([
              "style",
              `max-width:${svg.style.maxWidth};max-height:${svg.style.maxHeight}`,
            ]);
          }
          // Store HTML
          svgString = html;
        },
        element,
      );
    } catch (e) {
      // Create an error card svg with a red dotted border, and a title, and the error message in the body
      svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="180">
          <rect x="10" y="10" width="280" height="160" style="fill:rgb(255,255,255);stroke-width:1;stroke:rgb(255,0,0)" />
          <text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="red">${words("inventory.error.mermaid")}</text>
          <text x="50%" y="70%" alignment-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="red">${e}</text>
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
    return `<img ${slf.renderAttrs({ attrs: imageAttrs })}>`;
  }

  md.renderer.rules.fence = customFenceRenderer;
}
