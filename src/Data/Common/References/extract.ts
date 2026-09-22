import { Reference } from "@/Core/Domain";

/**
 * Pulls the `references` array off a resource's raw attributes. An absent or
 * non-array value means nothing to show, not an error (older exports omit the key).
 */
export const extractReferences = (
  attributes: Record<string, unknown>
): Reference.RawReference[] => {
  const value = attributes.references;

  return Array.isArray(value) ? (value as Reference.RawReference[]) : [];
};

/**
 * Pulls the `mutators` array off a resource's raw attributes, with the same
 * tolerance for an absent or non-array value as {@link extractReferences}.
 */
export const extractMutators = (attributes: Record<string, unknown>): Reference.RawMutator[] => {
  const value = attributes.mutators;

  return Array.isArray(value) ? (value as Reference.RawMutator[]) : [];
};
