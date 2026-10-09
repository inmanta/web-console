import { AttributeClassifier } from "@/Data/Common/AttributeClassifier/AttributeClassifier";
import { ClassifiedAttribute } from "@/Data/Common/AttributeClassifier/ClassifiedAttribute";

// includeAllKeys so an argument named `version` or `requires` still renders; the
// classifier keeps its password masking and json/xml/code detection.
const classifier = new AttributeClassifier({ includeAllKeys: true });

/**
 * Classifies one reference-argument value through the shared AttributeClassifier, so
 * an argument renders through the same pipeline as any resource attribute.
 *
 * @example classifyValue("name", "NETBOX_API_TOKEN")
 *   => { kind: "SingleLine", key: "name", value: "NETBOX_API_TOKEN" }
 */
export const classifyValue = (name: string, value: unknown): ClassifiedAttribute =>
  classifier.classify({ [name]: value })[0];
