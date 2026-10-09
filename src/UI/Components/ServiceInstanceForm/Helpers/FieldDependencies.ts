import { Field, JsonPath } from "@/Core";
import { FieldReference, getFieldReferences } from "@/Data/Queries";
import { words } from "@/UI/words";

/**
 * Static validation of the cascading field-dependency graph, built from the schema before any
 * value exists. Pipeline: flatten fields into nodes -> turn each `${form.*}`/`${self.*}` ref
 * into an edge (recording a missing-field error) -> detect a cycle. Surfaces two model errors:
 * a reference to a field that doesn't exist in scope, and a dependency cycle. (Blocking and
 * re-query are runtime concerns handled elsewhere.)
 */

/**
 * A field flattened out of the schema tree. `path` is the dotted, index-free schema path (the
 * node identity, e.g. `endpoints.uplink`); `scope` is the sibling fields it lives among (the
 * scope a `self` reference resolves in).
 */
interface FieldNode {
  path: string;
  field: Field;
  scope: Field[];
}

/** The prefix of a schema path (everything before the last segment), or "" at the root. */
const parentPath = (path: string): string =>
  path.includes(".") ? path.slice(0, path.lastIndexOf(".")) : "";

/** Flattens the field tree into nodes, recursing embedded entities (Nested/DictList). */
const walkFields = (fields: Field[], prefix = ""): FieldNode[] =>
  fields.flatMap((field) => {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    const node: FieldNode = { path, field, scope: fields };

    return field.kind === "Nested" || field.kind === "DictList"
      ? [node, ...walkFields(field.fields, path)]
      : [node];
  });

/**
 * The schema path of the field a reference targets, or null when no such field exists in scope
 * (`form` resolves against root fields, `self` among the node's siblings - no outward search).
 *
 * @example
 * resolveTargetPath(uplinkNode, { scope: "form", path: "site", raw: "form.site" }, rootFields) // => "site"
 */
const resolveTargetPath = (
  node: FieldNode,
  reference: FieldReference,
  rootFields: Field[]
): string | null => {
  const name = JsonPath.rootMember(reference.path);
  const scope = reference.scope === "self" ? node.scope : rootFields;
  const target = name === null ? undefined : scope.find((field) => field.name === name);

  if (!target) {
    return null;
  }

  // A `self` target is a sibling (shares the node's parent path); a `form` target is a
  // root field.
  const prefix = reference.scope === "self" ? parentPath(node.path) : "";

  return prefix ? `${prefix}.${target.name}` : target.name;
};

/**
 * Finds a cycle in the edge graph via DFS, returned as the node path from the repeated node
 * back to itself, or null when acyclic.
 *
 * @example
 * detectCycle(new Map([["a", ["b"]], ["b", ["a"]]])) // => ["a", "b", "a"]
 */
const detectCycle = (edges: Map<string, string[]>): string[] | null => {
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const stack: string[] = [];

  const visit = (node: string): string[] | null => {
    if (inStack.has(node)) {
      return [...stack.slice(stack.indexOf(node)), node];
    }
    if (visited.has(node)) {
      return null;
    }
    visited.add(node);
    inStack.add(node);
    stack.push(node);

    for (const next of edges.get(node) ?? []) {
      const cycle = visit(next);

      if (cycle) {
        return cycle;
      }
    }

    stack.pop();
    inStack.delete(node);

    return null;
  };

  for (const node of edges.keys()) {
    const cycle = visit(node);

    if (cycle) {
      return cycle;
    }
  }

  return null;
};

/**
 * Turns each node's field references into dependency edges (node path -> the paths it depends
 * on), collecting a missing-dependency error for any reference that names a field not in scope.
 *
 * @example
 * buildDependencyEdges(nodes, rootFields) // => { edges: Map { "uplink" => ["site"] }, errors: [] }
 */
const buildDependencyEdges = (
  nodes: FieldNode[],
  rootFields: Field[]
): { edges: Map<string, string[]>; errors: string[] } => {
  const edges = new Map<string, string[]>();
  const errors: string[] = [];

  for (const node of nodes) {
    const targets: string[] = [];

    for (const reference of getFieldReferences(node.field.suggestion)) {
      const targetPath = resolveTargetPath(node, reference, rootFields);

      if (targetPath === null) {
        errors.push(
          words("inventory.form.suggestions.missingDependency")(node.field.name, reference.raw)
        );
      } else {
        targets.push(targetPath);
      }
    }

    if (targets.length > 0) {
      edges.set(node.path, targets);
    }
  }

  return { edges, errors };
};

/**
 * Validates the cascading dependency graph of a form's fields (embedded entities walked
 * into), returning the model errors to surface (empty when well-formed).
 *
 * @example
 * resolveFieldDependencies(wellFormedFields) // => { errors: [] }
 */
export const resolveFieldDependencies = (fields: Field[]): { errors: string[] } => {
  // Flatten the schema into nodes, wire up dependency edges (recording missing targets), then
  // look for a cycle.
  const nodes = walkFields(fields);
  const { edges, errors } = buildDependencyEdges(nodes, fields);
  const cycle = detectCycle(edges);

  if (cycle) {
    errors.push(words("inventory.form.suggestions.dependencyCycle")(cycle.join(" -> ")));
  }

  return { errors };
};
