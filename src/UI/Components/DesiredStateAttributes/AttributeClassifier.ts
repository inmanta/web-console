import { CodeEditorProps, Language } from "@patternfly/react-code-editor";
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
   * Detects the code-editor language of a single raw string value by running it
   * through {@link classify} and mapping the resulting kind.
   *
   * @param value - The raw string value to classify.
   * @returns A {@link Language} for highlightable content, `undefined` for
   *   generic multiline "code" (shown without highlighting), or `null` for short
   *   plain text that should be shown inline rather than in the editor.
   */
  detectLanguage(value: string): CodeEditorProps["language"] | null {
    const [attribute] = this.classify({ value });

    return this.kindToLanguage(attribute?.kind);
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
        };
      }

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
   * Maps a classified kind to the code-editor language it should render as.
   *
   * @param kind - The classified attribute kind (or undefined when nothing matched).
   * @returns A {@link Language}, `undefined` for generic code, or `null` for inline text.
   */
  private kindToLanguage(
    kind: ClassifiedAttribute["kind"] | undefined
  ): CodeEditorProps["language"] | null {
    switch (kind) {
      case "Json":
        return Language.json;
      case "Xml":
        return Language.xml;
      case "Code":
        return undefined;
      default:
        return null;
    }
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
   * Determines if a string contains well-formed XML.
   * Uses the browser's DOMParser so malformed markup that merely starts with
   * `<` and ends with `>` isn't mistaken for XML.
   *
   * @param value - String to check
   * @returns True if the string is well-formed XML
   */
  private isXml(value: string): boolean {
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
}
