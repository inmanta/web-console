import { ReferenceArg } from "./Reference";

/**
 * Mutator carried on a resource's desired state (`attributes.mutators`). A
 * mutator describes a deferred mutation that the orchestrator will apply at
 * deploy time. Today the orchestrator only ships `core::Replace`, which
 * substitutes the value at a given `destination` (a JSONPath / dictpath
 * expression on the resource) with the resolution of a `value` reference.
 *
 * Source of truth for the contract:
 * `inmanta_core.references` — `Mutator`, `MutatorModel`, `ReplaceValue`.
 */
export interface Mutator {
  type: string;
  args: ReferenceArg[];
}

export const extractMutators = (attributes: Record<string, unknown>): Mutator[] => {
  const value = attributes.mutators;

  return Array.isArray(value) ? (value as Mutator[]) : [];
};

interface ReplaceMutation {
  destination: string;
  referenceId: string;
}

/**
 * Best-effort interpretation of a single mutator. Returns null for mutators
 * we do not (yet) know how to surface in the UI.
 */
const interpretReplace = (mutator: Mutator): ReplaceMutation | null => {
  if (mutator.type !== "core::Replace") {
    return null;
  }
  let destination: string | null = null;
  let referenceId: string | null = null;

  for (const arg of mutator.args) {
    if (arg.name === "destination" && arg.type === "literal" && typeof arg.value === "string") {
      destination = arg.value;
    } else if (arg.name === "value" && arg.type === "reference") {
      referenceId = arg.id;
    }
  }

  if (destination === null || referenceId === null) {
    return null;
  }

  return { destination, referenceId };
};

/**
 * Returns a `path → referenceId` map ready to feed `substituteReferences`.
 * The map's keys are JSONPath expressions rooted at the resource's
 * `attributes` object.
 */
export const buildMutatorSubstitutions = (mutators: Mutator[]): Record<string, string> => {
  const out: Record<string, string> = {};

  for (const mutator of mutators) {
    const replace = interpretReplace(mutator);

    if (replace) {
      out[replace.destination] = replace.referenceId;
    }
  }

  return out;
};
