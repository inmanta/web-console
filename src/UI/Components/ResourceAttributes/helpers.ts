import { Reference } from "@/Core/Domain";
import { ClassifiedAttribute } from "@/Data/Common/AttributeClassifier/ClassifiedAttribute";

/**
 * Keys inside `attributes` that are reference machinery, not user attributes.
 * They are hidden from the structured view (the JSON view still shows them).
 */
export const MACHINERY_KEYS = ["references", "mutators"];

/**
 * Attributes core adds to every resource (from `Resource.fields` and
 * `std::PurgeableResource`), grouped apart from the model's own; a resource missing
 * some just has a smaller group.
 */
export const FRAMEWORK_KEYS = [
  "send_event",
  "receive_events",
  "report_only",
  "purged",
  "purge_on_delete",
];

/**
 * Groups replacements by the attribute they target, so each attribute row can
 * look up the replacements that apply to it.
 *
 * @example groupReplacements([{ attributeKey: "api", ... }]) => { api: [{ ... }] }
 */
export const groupReplacements = (
  replacements: Reference.Replacement[]
): Record<string, Reference.Replacement[]> => {
  const grouped: Record<string, Reference.Replacement[]> = {};

  for (const replacement of replacements) {
    (grouped[replacement.attributeKey] ??= []).push(replacement);
  }

  return grouped;
};

/**
 * Splits classified attributes into the model's own attributes and the framework
 * ones, each keeping the alphabetical order the classifier already produced.
 */
export const partitionFramework = (
  attributes: ClassifiedAttribute[]
): { model: ClassifiedAttribute[]; framework: ClassifiedAttribute[] } => ({
  model: attributes.filter((attribute) => !FRAMEWORK_KEYS.includes(attribute.key)),
  framework: attributes.filter((attribute) => FRAMEWORK_KEYS.includes(attribute.key)),
});
