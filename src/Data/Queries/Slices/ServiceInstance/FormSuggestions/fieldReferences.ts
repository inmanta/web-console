import { FormSuggestion, GraphQLFilterValue, JsonPath, Maybe } from "@/Core";
import { isStringOrNumber } from "./helpers";
import {
  FieldReference,
  ParsedReference,
  extractReferences,
  isFieldReference,
} from "./suggestionVariables";

/**
 * Cascading field references: the `${form.<path>}` / `${self.<path>}` refs one field's
 * suggestion makes to other fields. Two jobs - extract them from an annotation (structure only,
 * no values) and resolve one to a value at runtime:
 *
 *   collectSuggestionReferences  annotation -> every ${...} ref, classified (context/field/unknown)
 *   getFieldReferences           annotation -> just the field refs (input to the dependency graph)
 *   getFieldDependencyNames      annotation -> the source field names (for the "blocked" hint)
 *   getUnsupportedFieldPaths     refs       -> field refs whose jsonpath we can't evaluate (model error)
 *   resolveFieldReference        one ref + form values -> its current value, or none (blocked)
 *
 * `form` reads from the form root, `self` from the field's own embedded instance. A reference
 * that matches no single non-empty scalar is "not ready yet", so the control blocks.
 */

/**
 * The data a field reference resolves against: `form` is the whole form state, `self` the
 * field's own instance sub-tree. For a top-level field the two coincide.
 *
 * @example
 * { form: { site: "a", endpoints: [{ region: "r1" }] }, self: { region: "r1" } }
 */
export interface FieldScopes {
  form: unknown;
  self: unknown;
}

/**
 * Resolves one field reference to its current value against the given scopes.
 * Returns `some(value)` only when the path matches exactly one non-empty scalar, else `none`.
 *
 * @example
 * resolveFieldReference({ scope: "form", path: "site", raw: "form.site" }, { form: { site: "a" }, self: {} }) // => some("a")
 */
export const resolveFieldReference = (
  reference: FieldReference,
  scopes: FieldScopes
): Maybe.Type<string> => {
  const root = reference.scope === "self" ? scopes.self : scopes.form;
  const result = JsonPath.evaluate(root, reference.path);

  if (Maybe.isSome(result) && isStringOrNumber(result.value)) {
    const value = String(result.value);

    if (value !== "") {
      return Maybe.some(value);
    }
  }

  return Maybe.none();
};

/**
 * Every `${...}` reference a suggestion declares, classified and deduplicated - from the
 * `parameter_name` (parameters flavor) or every `filter` value at any depth (graphql
 * flavor). The one collector the hook, blocking, and dependency graph all read.
 *
 * @example
 * collectSuggestionReferences({ type: "parameters", parameter_name: "r_${form.site}" }) // => [{ kind: "Field", ... }]
 */
export const collectSuggestionReferences = (
  suggestion: FormSuggestion | null | undefined
): ParsedReference[] => {
  if (!suggestion) {
    return [];
  }

  if (suggestion.type === "graphql") {
    return collectFilterReferences(suggestion.query?.filter);
  }

  if (suggestion.type === "parameters") {
    return extractReferences(suggestion.parameter_name ?? "");
  }

  return [];
};

/**
 * The raw `${...}` content of field references whose jsonpath falls outside the supported
 * navigational subset - a non-empty result is a model error.
 *
 * @example
 * getUnsupportedFieldPaths([{ kind: "Field", scope: "form", path: "a[*]", raw: "form.a[*]" }]) // => ["form.a[*]"]
 */
export const getUnsupportedFieldPaths = (references: ParsedReference[]): string[] =>
  references
    .filter(isFieldReference)
    .filter((reference) => !JsonPath.isSupportedPath(reference.path))
    .map((reference) => reference.raw);

/**
 * The `${form.*}`/`${self.*}` field references a suggestion declares (context and unknown
 * references dropped). The structural input to the dependency graph and blocked hint.
 *
 * @example
 * getFieldReferences({ type: "parameters", parameter_name: "r_${form.site}" }) // => [{ scope: "form", path: "site", raw: "form.site" }]
 */
export const getFieldReferences = (
  suggestion: FormSuggestion | null | undefined
): FieldReference[] => collectSuggestionReferences(suggestion).filter(isFieldReference);

/**
 * The names of the source fields a suggestion depends on (root member of each field-ref
 * path), deduplicated - used to tell the operator which field to fill in first.
 *
 * @example
 * getFieldDependencyNames({ type: "parameters", parameter_name: "r_${form.site}" }) // => ["site"]
 */
export const getFieldDependencyNames = (
  suggestion: FormSuggestion | null | undefined
): string[] => {
  const names = getFieldReferences(suggestion)
    .map((reference) => JsonPath.rootMember(reference.path))
    .filter((name): name is string => name !== null);

  return [...new Set(names)];
};

/**
 * Collects and deduplicates references across every graphql filter value at any depth,
 * classifying each (context / field / unknown).
 *
 * @example
 * collectFilterReferences({ site: "${form.site}" }) // => [{ kind: "Field", ... }]
 */
const collectFilterReferences = (
  filter?: Record<string, GraphQLFilterValue>
): ParsedReference[] => {
  const byRaw = new Map<string, ParsedReference>();

  const walk = (value: GraphQLFilterValue): void => {
    if (typeof value === "string") {
      for (const reference of extractReferences(value)) {
        if (!byRaw.has(reference.raw)) {
          byRaw.set(reference.raw, reference);
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (typeof value === "object" && value !== null) {
      Object.values(value).forEach(walk);
    }
  };

  Object.values(filter ?? {}).forEach(walk);

  return [...byRaw.values()];
};
