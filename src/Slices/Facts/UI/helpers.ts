import { CodeEditorProps } from "@patternfly/react-code-editor";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier } from "@/UI/Components";

/**
 * A classifier configured the way the Facts table needs it: multiline,
 * non-structured values are treated as generic "code" (shown in the editor
 * without highlighting). All the content-detection logic lives in
 * {@link AttributeClassifier}, so facts and resource attributes classify values
 * identically. Built lazily to avoid constructing formatters at module load.
 */
let classifier: AttributeClassifier | undefined;

function getClassifier(): AttributeClassifier {
  classifier ??= new AttributeClassifier(new JsonFormatter(), new XmlFormatter(), (key, value) => ({
    kind: "Code",
    key,
    value,
  }));

  return classifier;
}

/**
 * Number of characters shown in a value preview before it is truncated with an
 * ellipsis. Exported so tests can derive the expected preview string.
 */
export const VALUE_PREVIEW_LENGTH = 20;

/**
 * Classifies a raw fact value into the code-editor language it should be shown
 * as, delegating to the shared {@link AttributeClassifier}.
 *
 * @param value - The raw fact value string.
 * @returns The editor language, `undefined` for generic code, or `null` for inline text.
 */
export function detectLanguage(value: string): CodeEditorProps["language"] | null {
  return getClassifier().detectLanguage(value);
}

/**
 * Returns the display-ready version of a fact value, formatted by the shared
 * {@link AttributeClassifier} — JSON and XML are pretty-printed, generic code is
 * returned unchanged — so facts and resource attributes render identically.
 * Falls back to the raw value when nothing matched.
 *
 * @param value - The raw fact value string.
 */
export function getFormattedValue(value: string): string {
  const [attribute] = getClassifier().classify({ value });

  return attribute && "value" in attribute ? attribute.value : value;
}

/**
 * Returns `true` when a fact value should be shown in the code editor rather
 * than inline as plain text.
 *
 * @param value - The raw fact value string.
 */
export function isExpandableValue(value: string): boolean {
  return detectLanguage(value) !== null;
}

/**
 * Returns a truncated preview of a value. Values longer than
 * `VALUE_PREVIEW_LENGTH` are clipped and suffixed with `…`.
 *
 * @param value - The raw fact value string.
 * @returns The full value if short enough, otherwise the first
 *   `VALUE_PREVIEW_LENGTH` characters followed by `…`.
 */
export function getValuePreview(value: string): string {
  return value.length > VALUE_PREVIEW_LENGTH ? `${value.slice(0, VALUE_PREVIEW_LENGTH)}…` : value;
}
