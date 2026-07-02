import { JsonFormatter } from "../JsonFormatter";
import { XmlFormatter } from "../XmlFormatter";
import { ClassifiedAttribute } from "./ClassifiedAttribute";

/**
 * Classifies attribute key-value pairs into different types based on their content and format.
 * Used to determine how attributes should be displayed in the UI.
 *
 * The JSON/XML formatters and the multiline-as-`Code` behaviour are the same
 * everywhere, so they are baked in. The only thing that varies is `includeAllKeys`.
 *
 * @param options.includeAllKeys - When `true`, no key is filtered out. Defaults
 *   to `false`, which ignores the `version` and `requires` keys.
 */
export class AttributeClassifier {
  private readonly jsonFormatter = new JsonFormatter();
  private readonly xmlFormatter = new XmlFormatter();
  private readonly includeAllKeys: boolean;

  constructor({ includeAllKeys = false }: { includeAllKeys?: boolean } = {}) {
    this.includeAllKeys = includeAllKeys;
  }

  /**
   * Classifies all attributes in an object and returns them as a sorted array.
   *
   * @param attributesObject - Object containing attribute key-value pairs
   * @returns Array of classified attributes, sorted by key
   */
  classify(attributesObject: Record<string, unknown>): ClassifiedAttribute[] {
    return Object.entries(attributesObject)
      .map(([key, value]) => this.classifyKeyValue(key, value))
      .filter((attribute): attribute is ClassifiedAttribute => attribute !== null)
      .sort((a, b) => (a.key < b.key ? -1 : 1));
  }

  /**
   * Classifies a single key-value pair into an appropriate attribute type.
   *
   * @param key - The attribute key
   * @param value - The attribute value
   * @returns ClassifiedAttribute or null if the key should be ignored
   */
  private classifyKeyValue(key: string, value: unknown): ClassifiedAttribute | null {
    if (this.isKeyIgnored(key)) {
      return null;
    }

    if (this.isUndefined(value)) {
      return { kind: "Undefined", key };
    }

    if (this.isPassword(key)) {
      return {
        kind: "Password",
        key,
        value: "****",
      };
    }

    if (this.isFile(key)) {
      return { kind: "File", key, value: value as string };
    }

    if (this.isString(value)) {
      if (this.isJsonString(value)) {
        return {
          kind: "Json",
          key,
          value: this.jsonFormatter.format(JSON.parse(value)),
          // The original string is the raw form (byte-exact, no re-serialization).
          rawValue: value,
        };
      }

      if (this.isXml(value)) {
        return {
          kind: "Xml",
          key,
          value: this.xmlFormatter.format(value),
          rawValue: value,
        };
      }

      if (this.isMultiLine(value)) {
        // Multiline, non-structured strings render in the code editor without
        // syntax highlighting.
        return { kind: "Code", key, value };
      }

      return { kind: "SingleLine", key, value };
    }

    if (this.isObject(value)) {
      return {
        kind: "Json",
        key,
        value: this.jsonFormatter.format(value),
        // No source string exists for an object value; the compact JSON is the raw form.
        rawValue: JSON.stringify(value),
      };
    }

    // Default case for any other type of value
    return {
      kind: "SingleLine",
      key,
      value: `${value}`,
    };
  }

  /**
   * Determines if an attribute key should be skipped during classification.
   * Unless `includeAllKeys` was set, the `version` and `requires` keys are
   * ignored (they are framework metadata, not user-facing attributes).
   *
   * @param key - Key to check
   * @returns True if the key should be left out of the result
   */
  private isKeyIgnored(key: string): boolean {
    if (this.includeAllKeys) {
      return false;
    }

    return key === "version" || key === "requires";
  }

  /**
   * Checks if a value represents an undefined value.
   *
   * @param value - Value to check
   * @returns True if the value is the string "<<undefined>>"
   */
  private isUndefined(value: unknown): boolean {
    return value === "<<undefined>>";
  }

  /**
   * Determines if a key represents a password field.
   *
   * @param key - Key to check
   * @returns True if the key contains "password"
   */
  private isPassword(key: string): boolean {
    return key.indexOf("password") >= 0;
  }

  /**
   * Checks if a value is an object.
   *
   * @param value - Value to check
   * @returns True if the value is an object
   */
  private isObject(value: unknown): boolean {
    return typeof value === "object";
  }

  /**
   * Type guard to check if a value is a string.
   *
   * @param value - Value to check
   * @returns True if the value is a string
   */
  private isString(value: unknown): value is string {
    return typeof value === "string";
  }

  /**
   * Checks if a string parses to a JSON object or array (not a scalar).
   *
   * @param value - String to check
   * @returns True if the string is a JSON object or array
   */
  private isJsonString(value: string): boolean {
    try {
      const parsed = JSON.parse(value);

      return typeof parsed === "object" && parsed !== null;
    } catch {
      return false;
    }
  }

  /**
   * Determines if a string value should be treated as multiline.
   *
   * @param value - String value to check
   * @returns True if the string is longer than 80 chars or contains newlines
   */
  private isMultiLine(value: string): boolean {
    return value.length > 80 || value.indexOf("\n") >= 0;
  }

  /**
   * Checks if a key represents a file hash.
   *
   * @param key - Key to check
   * @returns True if the key is "hash"
   */
  private isFile(key: string): boolean {
    return key === "hash";
  }

  /**
   * Determines if a string looks like XML.
   * Uses a cheap structural check (starts with `<` and ends with `>`) rather
   * than parsing: XML payloads can be thousands of lines, and running untrusted
   * markup through DOMParser risks XSS for a marginal gain in precision.
   *
   * @param value - String to check
   * @returns True if the trimmed string starts with `<` and ends with `>`
   */
  private isXml(value: string): boolean {
    const trimmed = value.trim();

    return trimmed.startsWith("<") && trimmed.endsWith(">");
  }
}
