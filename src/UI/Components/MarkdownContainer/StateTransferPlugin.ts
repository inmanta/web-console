/* eslint-disable @typescript-eslint/no-explicit-any */
import { createElement } from "react";
import MarkdownIt from "markdown-it";
import { renderToStaticMarkup } from "react-dom/server";
import * as fa from "react-icons/fa";
import { words } from "@/UI";
import type { ButtonProps } from "@patternfly/react-core";

type PfButtonVariant = NonNullable<ButtonProps["variant"]>;
type PfStatusButtonVariant = Extract<PfButtonVariant, "danger" | "warning">;

const VALID_BUTTON_TYPES: PfButtonVariant[] = ["primary", "secondary", "tertiary", "link"];
const VALID_STATUS_VARIANTS: PfStatusButtonVariant[] = ["danger", "warning"];

const isValidType = (value: unknown): value is PfButtonVariant =>
  (VALID_BUTTON_TYPES as string[]).includes(value as string);

const isValidVariant = (value: unknown): value is PfStatusButtonVariant =>
  (VALID_STATUS_VARIANTS as string[]).includes(value as string);

/** Annotation-derived defaults for a `setState` button, keyed by target state. An
 * explicit codeblock value wins over these; these win over the hard-coded defaults. */
export interface SetStateButtonDefaults {
  displayText?: string;
  type?: PfButtonVariant;
  variant?: PfStatusButtonVariant;

  /** react-icons/fa component name, e.g. "FaSlidersH". */
  icon?: string;
}

interface StateTransferPluginOptions {
  stateTransferDefaults?: Record<string, SetStateButtonDefaults>;
}

/**
 * Renders the icon to a static SVG string via `renderToStaticMarkup`, since this
 * plugin builds plain HTML and can't mount a live React component like `DynamicFAIcon`.
 *
 * No `color` is passed and the icon isn't wrapped in PatternFly's `Icon` component -
 * both would force their own default color. Left alone, react-icons' `currentColor`
 * fill inherits the button's own `pf-m-*` icon color, which PatternFly already
 * contrasts correctly against that variant's background.
 */
function renderButtonIcon(icon: string | undefined): string {
  if (!icon) {
    return "";
  }

  const Icon = fa[icon as keyof typeof fa];

  if (!Icon) {
    return "";
  }

  // pf-v6-svg: PatternFly's own icon class, sizes to 1em and vertical-aligns it.
  const svg = renderToStaticMarkup(createElement(Icon, { className: "pf-v6-svg" }));

  return `<span class="pf-v6-c-button__icon pf-m-start" data-testid="${icon}">${svg}</span>`;
}

/**
 * Markdown-it plugin: replaces ```setState fences with a button element.
 * The button configuration comes from JSON in the fence content, falling back to
 * `options.stateTransferDefaults` for whatever fields it omits, then to hard-coded
 * defaults. Supports PatternFly 6 button variants, types, and modifiers.
 */
export default function stateTransferPlugin(
  md: MarkdownIt,
  _baseId: string,
  options: StateTransferPluginOptions
) {
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
    let icon: string | undefined;
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
        targetState = config.targetState;

        const defaults = targetState ? options.stateTransferDefaults?.[targetState] : undefined;

        if (config.displayText) {
          displayText = config.displayText;
        } else if (defaults?.displayText) {
          displayText = defaults.displayText;
        } else {
          displayText = targetState || "";
        }

        if (isValidType(config.type)) {
          type = config.type;
        } else if (isValidType(defaults?.type)) {
          type = defaults.type;
        }

        if (isValidVariant(config.variant)) {
          variant = config.variant;
        } else if (isValidVariant(defaults?.variant)) {
          variant = defaults.variant;
        }

        if (typeof config.icon === "string" && config.icon) {
          icon = config.icon;
        } else if (defaults?.icon) {
          icon = defaults.icon;
        }

        isInline = config.isInline === true || config.isInline === "true";
        isSmall = config.isSmall === true || config.isSmall === "true";

        // Show warning if targetState is missing
        if (!targetState) {
          hasConfigError = true;
          displayText = words("markdownContainer.setState.error.missingTargetState");
        }
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
    const iconMarkup = hasConfigError ? "" : renderButtonIcon(icon);

    return `<button class="${classes.join(" ")}" type="button"${disabledAttr} ${dataAttributes.join(" ")}>${iconMarkup}<span class="pf-v6-c-button__text">${escapedText}</span></button>`;
  }

  md.renderer.rules.fence = customFenceRenderer;
}
