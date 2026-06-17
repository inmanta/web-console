import { JsonFormatter } from "../JsonFormatter";
import { XmlFormatter } from "../XmlFormatter";
import { AttributeClassifier } from "./AttributeClassifier";

/**
 * Builds the {@link AttributeClassifier} the way the app uses it everywhere:
 * JSON/XML formatters wired in, and multiline, non-structured strings treated as
 * generic "code" (shown in the editor without highlighting). Centralised so
 * facts, resource attributes, logs and discovery all classify values identically
 * instead of each re-constructing the classifier inline.
 *
 * @param options.includeAllKeys - When `true`, no key is filtered out. Defaults
 *   to `false`, which ignores the `version` and `requires` keys (the class default).
 */
export function createAttributeClassifier({
  includeAllKeys = false,
}: { includeAllKeys?: boolean } = {}): AttributeClassifier {
  return new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter(),
    (key, value) => ({ kind: "Code", key, value }),
    includeAllKeys ? () => false : undefined
  );
}
