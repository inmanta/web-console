import { Reference } from "@/Core/Domain";
import { buildReplacement } from "./buildReplacement";

const buildMjsonReplacements = (
  references: Reference.RawArgument["references"]
): Reference.Replacement[] => {
  if (references === undefined) {
    return [];
  }

  return Object.entries(references).map(([destination, ref]) =>
    buildReplacement(destination, ref.id)
  );
};

/**
 * Normalizes one raw argument into the {@link Reference.Argument} union. A kind this
 * build does not model falls back to `unknown` with its raw payload, so an unexpected
 * argument renders instead of crashing. (The self `resource` arg is kept here and
 * dropped by the view.)
 *
 * @example normalizeArgument({ name: "name", type: "literal", value: "X" })
 *   => { kind: "literal", name: "name", value: "X" }
 */
export const normalizeArgument = (arg: Reference.RawArgument): Reference.Argument => {
  switch (arg.type) {
    case "literal":
      return { kind: "literal", name: arg.name, value: arg.value };
    case "json":
      return { kind: "json", name: arg.name, value: arg.value };
    case "mjson":
      return {
        kind: "mjson",
        name: arg.name,
        value: arg.value,
        replacements: buildMjsonReplacements(arg.references),
      };
    case "reference":
      return { kind: "reference", name: arg.name, referenceId: arg.id ?? "" };
    case "resource":
      return { kind: "resource", name: arg.name, resourceId: arg.id ?? "" };
    case "python_type":
      return { kind: "python_type", name: arg.name, value: String(arg.value ?? "") };
    case "get":
      return {
        kind: "get",
        name: arg.name,
        expression: arg.dict_path_expression ?? (typeof arg.value === "string" ? arg.value : ""),
      };
    default:
      return { kind: "unknown", name: arg.name, type: arg.type, raw: arg };
  }
};

/**
 * Normalizes a raw reference node, turning each of its arguments into the
 * {@link Reference.Argument} union while leaving the node's id and registered
 * `type` untouched.
 */
export const normalizeReference = (reference: Reference.RawReference): Reference.Reference => ({
  id: reference.id,
  type: reference.type,
  args: reference.args.map(normalizeArgument),
});

/**
 * Builds the id-to-node lookup the view walks; the payload's list order is
 * meaningless (uuid-sorted), so nodes are reached by id from the mutators down.
 *
 * @example indexReferences([{ id: "b5d776d4", type: "std::Environment", args: [] }])
 *   => { b5d776d4: { id: "b5d776d4", type: "std::Environment", args: [] } }
 */
export const indexReferences = (references: Reference.RawReference[]): Reference.ReferenceIndex => {
  const index: Reference.ReferenceIndex = {};

  for (const reference of references) {
    index[reference.id] = normalizeReference(reference);
  }

  return index;
};
