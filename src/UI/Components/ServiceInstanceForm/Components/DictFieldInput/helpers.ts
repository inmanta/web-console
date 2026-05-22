export type DictPrimitive = string | number | boolean;
export type DictValue = Record<string, DictPrimitive | object>;

/**
 * Converts a JavaScript object into a formatted JSON string.
 *
 * If the input is not a valid object or is empty, returns an empty JSON object string ("{}").
 *
 * @param {unknown} value - The value to convert into a JSON string.
 * @returns {string} A pretty-printed JSON string representation of the object.
 */
export function toText(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "{}";
  }
  if (Object.keys(value).length === 0) {
    return "{}";
  }

  return JSON.stringify(value, null, 2);
}

/**
 * Parses a JSON string into a dictionary object.
 *
 * Only valid JSON objects (non-array, non-null) are accepted.
 * Returns null if parsing fails or the structure is invalid.
 *
 * @param {string} text - JSON string to parse.
 * @returns {DictValue | null} Parsed object or null if invalid.
 */
export function toDict(text: string): DictValue | null {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}
