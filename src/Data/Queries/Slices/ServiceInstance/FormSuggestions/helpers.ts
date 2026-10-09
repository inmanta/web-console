import { SuggestionValue } from "@/Core";

/**
 * Normalizing raw suggestion entries into the form's single `{ label, value }[]` contract,
 * shared by every flavor.
 *
 *   normalizeSuggestions  raw values (unknown) -> { label, value }[] (or null if not an array)
 *   isStringOrNumber      type guard for a scalar leaf
 */

/**
 * Type guard for a string or number scalar.
 *
 * @example
 * isStringOrNumber(3)  // => true
 * isStringOrNumber({}) // => false
 */
export const isStringOrNumber = (value: unknown): value is string | number =>
  typeof value === "string" || typeof value === "number";

/**
 * Type guard for an explicit `{ label, value }` pair (each field a string or number, coerced to
 * strings when normalized).
 *
 * @example
 * isLabelValuePair({ label: "1 Gbps", value: 1000 }) // => true
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
 * Normalizes raw suggestion entries into `{ label, value }[]`: a bare scalar becomes a pair with
 * `label === value`, an explicit pair is string-coerced, anything else is dropped. Returns null
 * when `values` is not an array.
 *
 * @example
 * normalizeSuggestions(["dot1q", { label: "10 Gbps", value: 10000 }]) // => [{label:"dot1q",value:"dot1q"}, {label:"10 Gbps",value:"10000"}]
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
