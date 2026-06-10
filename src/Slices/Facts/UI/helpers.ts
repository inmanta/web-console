import { Language } from "@patternfly/react-code-editor";
import { XmlFormatter } from "@/Data/Common";

// ─── Constants & Types ────────────────────────────────────────────────────────

/**
 * Number of characters shown in the value column before the preview is
 * truncated with an ellipsis. Keep in sync with the constant imported in
 * Page.test.tsx when computing expected preview strings.
 */
export const VALUE_PREVIEW_LENGTH = 20;

/**
 * The detected format of a fact value string.
 * - `"json"`   — a JSON object or array
 * - `"xml"`    — valid XML markup
 * - `"python"` — a Python-style dict/list/tuple literal
 * - `"plain"`  — anything else; shown inline in the table, not expandable
 */
export type ValueType = "json" | "xml" | "python" | "plain";

// ─── Detection ────────────────────────────────────────────────────────────────

/** Returns true when the value is a JSON object or array (not a scalar). */
function isJsonObject(value: string): boolean {
  try {
    const parsed = JSON.parse(value);

    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

/**
 * Returns true when the value is well-formed XML.
 * Uses the browser's DOMParser so we get a proper parse error instead of
 * relying on a simple `startsWith("<")` heuristic.
 */
function isXml(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed.startsWith("<")) {
    return false;
  }
  try {
    const doc = new DOMParser().parseFromString(trimmed, "application/xml");

    return !doc.querySelector("parsererror");
  } catch {
    return false;
  }
}

/**
 * Returns true when the value looks like a Python dict, list, or tuple.
 * Detection requires the value to start with `{`, `[`, or `(` AND contain at
 * least one Python-specific token (`True`, `False`, `None`) or a
 * single-quoted string — both of which are illegal in JSON.
 */
function isPythonLike(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed.startsWith("{") && !trimmed.startsWith("[") && !trimmed.startsWith("(")) {
    return false;
  }

  return /\bTrue\b|\bFalse\b|\bNone\b/.test(trimmed) || /'[^']*'/.test(trimmed);
}

/**
 * Classifies a fact value string into one of the supported format types.
 * The order of checks matters: JSON is tried first because a JSON string also
 * starts with `{` or `[`, which would otherwise trigger `isPythonLike`.
 *
 * @param value - The raw fact value string to classify.
 * @returns The detected `ValueType`.
 */
export function detectValueType(value: string): ValueType {
  if (isJsonObject(value)) {
    return "json";
  }
  if (isXml(value)) {
    return "xml";
  }
  if (isPythonLike(value)) {
    return "python";
  }

  return "plain";
}

/**
 * Returns `true` when a fact value should be shown in an expandable code
 * editor rather than inline in the table cell.
 *
 * @param value - The raw fact value string.
 */
export function isExpandableValue(value: string): boolean {
  return detectValueType(value) !== "plain";
}

// ─── Display ──────────────────────────────────────────────────────────────────

/**
 * Returns a truncated preview of a value for display in the table cell.
 * Values longer than `VALUE_PREVIEW_LENGTH` are clipped and suffixed with `…`.
 *
 * @param value - The raw fact value string.
 * @returns The full value if short enough, otherwise the first
 *   `VALUE_PREVIEW_LENGTH` characters followed by `…`.
 */
export function getValuePreview(value: string): string {
  return value.length > VALUE_PREVIEW_LENGTH ? `${value.slice(0, VALUE_PREVIEW_LENGTH)}…` : value;
}

/**
 * Maps each expandable `ValueType` to the corresponding PatternFly
 * `CodeEditor` language for syntax highlighting.
 */
export const LANGUAGE_MAP: Record<Exclude<ValueType, "plain">, Language> = {
  json: Language.json,
  xml: Language.xml,
  python: Language.python,
};

/**
 * Returns the content string to pass to the `CodeEditor`.
 * JSON and XML are pre-formatted before display; Python is passed as-is
 * because no formatter is available for Python literals.
 *
 * @param value - The raw fact value string.
 * @param type  - The detected `ValueType` of the value.
 * @returns The display-ready code string.
 */
const xmlFormatter = new XmlFormatter();

export function getCodeContent(value: string, type: ValueType): string {
  switch (type) {
    case "json":
      return JSON.stringify(JSON.parse(value), null, 2);
    case "xml":
      return xmlFormatter.format(value);
    default:
      return value;
  }
}
