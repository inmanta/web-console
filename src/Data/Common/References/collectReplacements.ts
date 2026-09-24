import { Reference } from "@/Core/Domain";
import { buildReplacement } from "./buildReplacement";

/**
 * The replacements a resource's mutators describe, plus a count of the mutators that
 * could not become one (a non-`core::Replace`, or a `core::Replace` whose value is a
 * literal). The count feeds the "N mutators are not displayed" note.
 */
export interface CollectedReplacements {
  replacements: Reference.Replacement[];
  undisplayedCount: number;
}

const findArg = (mutator: Reference.RawMutator, name: string) =>
  mutator.args.find((arg) => arg.name === name);

/**
 * Flattens a resource's mutators into {@link Reference.Replacement}s, one per
 * `core::Replace` that names a destination and a reference; the rest are counted.
 *
 * @example collectReplacements([{ type: "core::Replace", args: [...] }])
 *   => { replacements: [{ destination: "value", attributeKey: "value", ... }], undisplayedCount: 0 }
 */
export const collectReplacements = (mutators: Reference.RawMutator[]): CollectedReplacements => {
  const replacements: Reference.Replacement[] = [];

  for (const mutator of mutators) {
    if (mutator.type !== Reference.REPLACE_MUTATOR_TYPE) {
      continue;
    }

    const destination = findArg(mutator, "destination");
    const value = findArg(mutator, "value");

    if (
      destination?.type !== "literal" ||
      typeof destination.value !== "string" ||
      value?.type !== "reference" ||
      typeof value.id !== "string"
    ) {
      continue;
    }

    replacements.push(buildReplacement(destination.value, value.id));
  }

  return { replacements, undisplayedCount: mutators.length - replacements.length };
};
