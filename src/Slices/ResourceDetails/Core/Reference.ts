/**
 * Domain types for the `references` array carried on a resource's desired state
 * (`details.attributes.references`). Scoped to the ResourceDetails slice — the
 * canonical `attributes` field on `Resource.Details` stays typed as
 * `Record<string, unknown>` because not every consumer expects this shape.
 */

export type ReferenceArg =
  | LiteralArg
  | ReferenceRefArg
  | ResourceRefArg
  | MjsonArg;

export interface LiteralArg {
  name: string;
  type: "literal";
  value: unknown;
}

export interface ReferenceRefArg {
  name: string;
  type: "reference";
  id: string;
}

export interface ResourceRefArg {
  name: string;
  type: "resource";
  id: string;
}

export interface MjsonArg {
  name: string;
  type: "mjson";
  value: unknown;
  references?: Record<string, { id: string; name: string; type: string }>;
}

export interface Reference {
  id: string;
  type: string;
  args: ReferenceArg[];
}

export const isReferenceArg = (arg: ReferenceArg): arg is ReferenceRefArg =>
  arg.type === "reference";

export const isResourceArg = (arg: ReferenceArg): arg is ResourceRefArg =>
  arg.type === "resource";

/**
 * Pulls the `references` array off the raw attributes blob. Returns an empty
 * array when the field is missing or not an array.
 */
export const extractReferences = (attributes: Record<string, unknown>): Reference[] => {
  const value = attributes.references;

  return Array.isArray(value) ? (value as Reference[]) : [];
};
