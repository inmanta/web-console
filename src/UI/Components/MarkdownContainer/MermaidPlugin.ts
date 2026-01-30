/* eslint-disable @typescript-eslint/no-explicit-any */
import MarkdownIt from "markdown-it";

/**
 * Markdown-it plugin: replaces ```mermaid fences with <pre class="mermaid"> blocks.
 * Actual rendering is done later by Mermaid's run() or init() API in MarkdownContainer,
 * after React has rendered the DOM. This approach works reliably with accordions and
 * other collapsible content.
 */
export default function mermaidPlugin(md: MarkdownIt, _baseId: string, _options: any) {
  function getLangName(info: string): string {
    return info.split(/\s+/g)[0];
  }

  const defaultFenceRenderer = md.renderer.rules.fence;

  function customFenceRenderer(
    tokens: any[],
    idx: number,
    _options: any,
    _env: any,
    _slf: any
  ): string {
    const token = tokens[idx];
    const info = token.info.trim();
    const langName = info ? getLangName(info) : "";

    // Not a mermaid block → delegate to default renderer
    if (["mermaid", "{mermaid}"].indexOf(langName) === -1) {
      // Not a mermaid block, use default fence renderer
      if (defaultFenceRenderer !== undefined) {
        return defaultFenceRenderer(tokens, idx, _options, _env, _slf);
      }

      return "";
    }

    // For mermaid blocks, emit a <pre class="mermaid"> that Mermaid will
    // process later via its run() or init() API. This avoids React rendering issues.
    const content = md.utils.escapeHtml(token.content);
    return `<pre class="mermaid">${content}</pre>`;
  }

  md.renderer.rules.fence = customFenceRenderer;
}
