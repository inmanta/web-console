import { ClassifiedAttribute, createAttributeClassifier } from "@/Data";
import { isEditorKind } from "@/UI/Components";

/**
 * Facts-configured classifier (lazy singleton). All content-detection and
 * formatting logic lives in the shared {@link createAttributeClassifier}, so
 * facts and resource attributes classify values identically. Built lazily to
 * avoid constructing formatters at module load.
 */
let classifier: ReturnType<typeof createAttributeClassifier> | undefined;

/**
 * Classifies a single raw fact value via the shared classifier. The resulting
 * {@link ClassifiedAttribute} `kind` decides how the row renders: structured and
 * generic "code" kinds expand into the editor, everything else shows inline.
 *
 * @param value - The raw fact value string.
 */
export function classifyValue(value: string): ClassifiedAttribute {
  classifier ??= createAttributeClassifier();

  return classifier.classify({ value })[0];
}

/**
 * Returns `true` when a fact value should expand into the code editor (structured
 * or generic "code") rather than render inline as plain text.
 *
 * @param value - The raw fact value string.
 */
export function isExpandableValue(value: string): boolean {
  return isEditorKind(classifyValue(value).kind);
}

/**
 * Number of characters shown in a value preview before it is truncated with an
 * ellipsis. Exported so tests can derive the expected preview string.
 */
export const VALUE_PREVIEW_LENGTH = 20;

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
