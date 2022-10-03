import { Maybe, Formatter } from "@/Core";
import { ClassifiedAttribute } from "./ClassifiedAttribute";

export class AttributeClassifier {
  constructor(
    private readonly jsonFormatter: Formatter<unknown>,
    private readonly xmlFormatter: Formatter,
    private readonly multilineClassifier: (
      key: string,
      value: string
    ) => Maybe.Type<ClassifiedAttribute> = (key, value) =>
      Maybe.some({ kind: "MultiLine", key, value }),
    private readonly isKeyIgnored: (key: string) => boolean = (key: string) =>
      key === "version" || key === "requires"
  ) {}

  classify(attributesObject: Record<string, unknown>): ClassifiedAttribute[] {
    return Object.entries(attributesObject)
      .map(([key, value]) => this.classifyKeyValue(key, value))
      .filter(Maybe.isSome)
      .map((some) => some.value)
      .sort((a, b) => (a.key < b.key ? -1 : 1));
  }

  private classifyKeyValue(
    key: string,
    value: unknown
  ): Maybe.Type<ClassifiedAttribute> {
    if (this.isKeyIgnored(key)) {
      return Maybe.none();
    } else if (this.isUndefined(value)) {
      return Maybe.some({ kind: "Undefined", key });
    } else if (this.isPassword(key)) {
      return Maybe.some({
        kind: "Password",
        key,
        value: "****",
      });
    } else if (this.isFile(key)) {
      return Maybe.some({ kind: "File", key, value: value as string });
    } else if (this.isString(value)) {
      if (this.isXml(value)) {
        return Maybe.some({
          kind: "Xml",
          key,
          value: this.xmlFormatter.format(value),
        });
      } else if (this.isMultiLine(value)) {
        return this.multilineClassifier(key, value);
      }
      return Maybe.some({ kind: "SingleLine", key, value });
    } else if (this.isObject(value)) {
      return Maybe.some({
        kind: "Json",
        key,
        value: this.jsonFormatter.format(value),
      });
    }

    return Maybe.some({
      kind: "SingleLine",
      key,
      value: `${value}`,
    });
  }

  private isUndefined(value: unknown): boolean {
    return value === "<<undefined>>";
  }

  private isPassword(key: string): boolean {
    return key.indexOf("password") >= 0;
  }

  private isObject(value: unknown): boolean {
    return typeof value === "object";
  }

  private isString(value: unknown): value is string {
    return typeof value === "string";
  }

  private isMultiLine(value: string): boolean {
    return value.length > 80 || value.indexOf("\n") >= 0;
  }

  private isFile(key: string): boolean {
    return key === "hash";
  }

  private isXml(value: string): boolean {
    const trimmedValue = value.trimStart().trimEnd();
    return trimmedValue.startsWith("<") && trimmedValue.endsWith(">");
  }
}
