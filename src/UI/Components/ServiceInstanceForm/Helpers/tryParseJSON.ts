/**
 * Parses `value` as JSON, returning the original value if parsing fails (never throws).
 *
 * @param {unknown} value - The value to attempt to parse as JSON
 * @returns The parsed JSON value if successful, or the original value if parsing fails
 */
export const tryParseJSON = (value: unknown) => {
  try {
    if (typeof value === "string") {
      return JSON.parse(value);
    }

    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    // If the value is not a valid JSON string, return the original value
    return value;
  }
};
