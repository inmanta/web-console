export type DictValue = Record<string, unknown>;

/**
 * Converts a value into a formatted JSON string for display in the editor.
 *
 * - null   → "null"
 * - string → tries to parse as JSON first (handles pre-stringified objects)
 * - object → pretty-printed JSON
 * - other  → "{}"
 *
 * @param {unknown} value - The value to convert into a JSON string.
 * @returns {string} A pretty-printed JSON string representation of the value.
 */
export function toText(value: unknown): string {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;

    if (parsed !== null && (typeof parsed !== "object" || Array.isArray(parsed))) {
      return "{}";
    }

    return JSON.stringify(parsed, null, 2);
  } catch {
    return "{}";
  }
}

/**
 * Parses a JSON string into a dictionary object or null.
 *
 * Returns undefined (error sentinel) when parsing fails or the result is not a plain object or null.
 * Returns null when the JSON is the literal "null".
 * Returns a DictValue object otherwise.
 *
 * @param {string} text - JSON string to parse.
 * @returns {DictValue | null | undefined} Parsed object, null, or undefined on error.
 */
export function toDict(text: string): DictValue | null | undefined {
  try {
    const parsed = JSON.parse(text);

    if (parsed === null) {
      return null;
    }

    if (typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }

    return undefined;
  } catch {
    return undefined;
  }
}
