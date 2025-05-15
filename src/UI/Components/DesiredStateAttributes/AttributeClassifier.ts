import { Formatter } from "@/Core";
import { ClassifiedAttribute } from "./ClassifiedAttribute";

/**
 * Classifies attribute key-value pairs into different types based on their content and format.
 * Used to determine how attributes should be displayed in the UI.
 */
export class AttributeClassifier {
  /**
   * Creates a new AttributeClassifier.
   *
   * @param jsonFormatter - Formatter for JSON values
   * @param xmlFormatter - Formatter for XML strings
   * @param multilineClassifierFn - Custom classifier for multiline strings
   * @param isKeyIgnored - Function to determine if an attribute key should be ignored
   */
  constructor(
    private readonly jsonFormatter: Formatter<unknown>,
    private readonly xmlFormatter: Formatter,
    private readonly multilineClassifierFn: (
      key: string,
      value: string
    ) => ClassifiedAttribute | null = (key, value) => ({ kind: "MultiLine", key, value }),
    private readonly isKeyIgnored: (key: string) => boolean = (key: string) =>
      key === "version" || key === "requires"
  ) {}

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
      if (this.isXml(value)) {
        return {
          kind: "Xml",
          key,
          value: this.xmlFormatter.format(value),
        };
      }

      if (this.isMultiLine(value)) {
        return this.multilineClassifierFn(key, value);
      }

      return { kind: "SingleLine", key, value };
    }

    if (this.isObject(value)) {
      return {
        kind: "Json",
        key,
        value: this.jsonFormatter.format(value),
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
   * Determines if a string contains XML content.
   *
   * @param value - String to check
   * @returns True if the string appears to be XML (starts with < and ends with >)
   */
  private isXml(value: string): boolean {
    const trimmedValue = value.trimStart().trimEnd();

    return trimmedValue.startsWith("<") && trimmedValue.endsWith(">");
  }
}
