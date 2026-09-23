import { Reference } from "@/Core/Domain";

type RawEntry = { args: unknown[] } & Record<string, unknown>;

// Every entry needs an `args` array; the engine maps and searches it without checks.
const hasArgs = (entry: unknown): entry is RawEntry =>
  typeof entry === "object" && entry !== null && Array.isArray((entry as RawEntry).args);

const isRawReference = (entry: unknown): entry is Reference.RawReference =>
  hasArgs(entry) && typeof entry.id === "string";

const isRawMutator = (entry: unknown): entry is Reference.RawMutator =>
  hasArgs(entry) && typeof entry.type === "string";

/**
 * Pulls the `references` array off a resource's raw attributes, dropping malformed
 * entries (no string `id` or no `args` array). An absent or non-array value means
 * nothing to show, not an error (older exports omit the key).
 */
export const extractReferences = (
  attributes: Record<string, unknown>
): Reference.RawReference[] => {
  const value = attributes.references;

  return Array.isArray(value) ? value.filter(isRawReference) : [];
};

/**
 * Pulls the `mutators` array off a resource's raw attributes, dropping malformed
 * entries, with the same tolerance for an absent or non-array value as
 * {@link extractReferences}.
 */
export const extractMutators = (attributes: Record<string, unknown>): Reference.RawMutator[] => {
  const value = attributes.mutators;

  return Array.isArray(value) ? value.filter(isRawMutator) : [];
};
