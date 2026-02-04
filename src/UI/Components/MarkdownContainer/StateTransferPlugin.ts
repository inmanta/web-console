/* eslint-disable @typescript-eslint/no-explicit-any */
import MarkdownIt from "markdown-it";

/**
 * Markdown-it plugin: replaces ```setState fences with a button element.
 * The button configuration comes from JSON in the fence content.
 * Supports PatternFly 6 button variants, types, and modifiers.
 */
export default function stateTransferPlugin(md: MarkdownIt, _baseId: string, _options: any) {
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

    // Not a setState block → delegate to default renderer
    if (langName !== "setState") {
      // Not a setState block, use default fence renderer
      if (defaultFenceRenderer !== undefined) {
        return defaultFenceRenderer(tokens, idx, _options, _env, _slf);
      }

      return "";
    }

    // Parse configuration from content
    const content = token.content.trim();
    let displayText = "Set State";
    let type = "primary";
    let variant: string | undefined;
    let targetState: string | undefined;
    let isInline = false;
    let isSmall = false;

    // Try to parse as JSON configuration
    try {
      const config = JSON.parse(content);
      if (config.displayText) {
        displayText = config.displayText;
      }
      if (config.type && ["primary", "secondary", "tertiary", "link"].includes(config.type)) {
        type = config.type;
      }
      if (config.variant && ["danger", "warning"].includes(config.variant)) {
        variant = config.variant;
      }
      if (config.targetState) {
        targetState = config.targetState;
      }
      if (config.isInline === true || config.isInline === "true") {
        isInline = true;
      }
      if (config.isSmall === true || config.isSmall === "true") {
        isSmall = true;
      }
    } catch {
      // If not JSON, treat the entire content as displayText (backward compatibility)
      displayText = content || "Set State";
    }

    const escapedText = md.utils.escapeHtml(displayText);
    const escapedContent = md.utils.escapeHtml(content);
    
    // Build PatternFly 6 classes
    const classes = ["pf-v6-c-button"];
    
    // Add type modifier (primary, secondary, tertiary, link)
    classes.push(`pf-m-${type}`);
    
    // Add variant modifier if present (danger, warning)
    if (variant) {
      classes.push(`pf-m-${variant}`);
    }
    
    // Add inline modifier if requested
    if (isInline) {
      classes.push("pf-m-inline");
    }
    
    // Add small modifier if requested
    if (isSmall) {
      classes.push("pf-m-small");
    }

    // Build data attributes
    const dataAttributes: string[] = [];
    dataAttributes.push(`data-setstate-content="${escapedContent}"`);
    if (targetState) {
      dataAttributes.push(`data-setstate-target="${md.utils.escapeHtml(targetState)}"`);
    }

    // Create a button element with PatternFly 6 classes
    // The button will be styled via PatternFly CSS and can have click handlers attached in MarkdownContainer
    return `<button class="${classes.join(" ")}" type="button" ${dataAttributes.join(" ")}>${escapedText}</button>`;
  }

  md.renderer.rules.fence = customFenceRenderer;
}
