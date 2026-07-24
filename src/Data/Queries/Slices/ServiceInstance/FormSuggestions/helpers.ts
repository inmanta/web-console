import { SuggestionValue } from "@/Core";

/**
 * Type guard for a string or number scalar.
 *
 * @param value - The value to check.
 * @returns Whether the value is a string or a number.
 */
const isStringOrNumber = (value: unknown): value is string | number =>
  typeof value === "string" || typeof value === "number";

/**
 * Type guard for an explicit `{ label, value }` suggestion pair.
 *
 * Both fields may be a string or a number (e.g. numeric attributes); they are
 * coerced to strings when normalized.
 *
 * @param entry - The raw entry to check.
 * @returns Whether the entry is a `{ label, value }` pair of scalars.
 */
const isLabelValuePair = (
  entry: unknown
): entry is { label: string | number; value: string | number } =>
  typeof entry === "object" &&
  entry !== null &&
  "label" in entry &&
  "value" in entry &&
  isStringOrNumber(entry.label) &&
  isStringOrNumber(entry.value);

/**
 * Normalizes a raw list of suggestion entries into a single `{ label, value }[]` shape.
 *
 * Every flavor (literal, parameters, ...) is reduced to this shape so the rest
 * of the form only deals with one contract. A bare scalar normalizes to a pair
 * where `label === value`; an explicit pair has its (possibly numeric) fields
 * coerced to strings; anything else is dropped.
 *
 * @param values - The raw values, of unknown shape.
 * @returns The normalized suggestions, or null when `values` is not an array.
 */
export const normalizeSuggestions = (values: unknown): SuggestionValue[] | null => {
  if (!Array.isArray(values)) {
    return null;
  }

  return values.reduce<SuggestionValue[]>((acc, entry) => {
    if (isStringOrNumber(entry)) {
      acc.push({ label: String(entry), value: String(entry) });
    } else if (isLabelValuePair(entry)) {
      acc.push({ label: String(entry.label), value: String(entry.value) });
    }

    return acc;
  }, []);
};
