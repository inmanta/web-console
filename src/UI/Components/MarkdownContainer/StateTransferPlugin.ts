/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ButtonProps } from "@patternfly/react-core";
import MarkdownIt from "markdown-it";
import { words } from "@/UI";

type PfButtonVariant = NonNullable<ButtonProps["variant"]>;
type PfStatusButtonVariant = Extract<PfButtonVariant, "danger" | "warning">;

const VALID_BUTTON_TYPES: PfButtonVariant[] = ["primary", "secondary", "tertiary", "link"];
const VALID_STATUS_VARIANTS: PfStatusButtonVariant[] = ["danger", "warning"];

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
    let displayText = "";
    let type: PfButtonVariant = "primary";
    let variant: PfStatusButtonVariant | undefined;
    let targetState: string | undefined;
    let isInline = false;
    let isSmall = false;
    let hasConfigError = false;

    // Try to parse as JSON configuration
    try {
      const config = JSON.parse(content);

      // Check if config is an array (invalid format)
      if (Array.isArray(config)) {
        hasConfigError = true;
        displayText = words("markdownContainer.setState.error.invalidConfigArray");
      } else if (typeof config !== "object" || config === null) {
        hasConfigError = true;
        displayText = words("markdownContainer.setState.error.invalidConfig");
      } else {
        // Valid object config - extract values with defaults
        targetState =
          config.targetState || words("markdownContainer.setState.error.missingTargetState");

        displayText = config.displayText || targetState || "";

        type = (VALID_BUTTON_TYPES as string[]).includes(config.type)
          ? (config.type as PfButtonVariant)
          : type;

        variant = (VALID_STATUS_VARIANTS as string[]).includes(config.variant)
          ? (config.variant as PfStatusButtonVariant)
          : variant;

        isInline = config.isInline === true || config.isInline === "true";
        isSmall = config.isSmall === true || config.isSmall === "true";
      }
    } catch {
      // If not JSON, treat the entire content as displayText (backward compatibility)
      displayText = content || words("markdownContainer.setState.error.cannotParseJson");
    }

    const escapedText = md.utils.escapeHtml(displayText);
    const escapedContent = md.utils.escapeHtml(content);

    // Build PatternFly 6 classes
    const classes = ["pf-v6-c-button"];

    // Add type modifier (primary, secondary, tertiary, link)
    classes.push(`pf-m-${type}`);

    // Add variant modifier if present (danger, warning)
    // If there's a config error, use warning variant to indicate the issue
    if (hasConfigError) {
      variant = "warning";
      classes.push("pf-m-warning");
    } else if (variant) {
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
    if (hasConfigError) {
      dataAttributes.push('data-setstate-error="true"');
    }

    // Create a button element with PatternFly 6 classes
    // The button will be styled via PatternFly CSS and can have click handlers attached in MarkdownContainer
    const disabledAttr = hasConfigError ? " disabled" : "";
    return `<button class="${classes.join(" ")}" type="button"${disabledAttr} ${dataAttributes.join(" ")}>${escapedText}</button>`;
  }

  md.renderer.rules.fence = customFenceRenderer;
}
