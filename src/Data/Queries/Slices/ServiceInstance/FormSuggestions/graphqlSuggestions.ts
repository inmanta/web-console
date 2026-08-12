import {
  GraphQLFilterValue,
  GraphQLSuggestionQuery,
  JsonPath,
  Maybe,
  RawFormSuggestion,
} from "@/Core";
import { isStringOrNumber } from "./helpers";
import { SuggestionVariables, extractVariables, substituteVariables } from "./suggestionVariables";

/**
 * Runtime construction, projection and validation for the `graphql` suggestion
 * flavor, whose query is generated from annotation data rather than a static
 * `gql`. Two languages meet in one annotation: `filter` keys are camelCase GraphQL
 * schema fields (sent to the server), while `label`/`value` are snake_case
 * jsonpath projections into each returned node (evaluated client-side). Paging is
 * bounded by {@link SUGGESTION_PAGE_SIZE}; server-side search-as-you-type is a follow-up.
 */

/** Upper bound on nodes fetched for one suggestion query. */
export const SUGGESTION_PAGE_SIZE = 250;

/**
 * Serializes a filter value into a GraphQL literal. Strings go through
 * `JSON.stringify`, whose output is a valid, escaped GraphQL string literal, so a
 * form-supplied value with quotes or newlines can't break out of the query
 * (injection-safe).
 */
const serializeGraphQLValue = (value: GraphQLFilterValue): string => {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  return String(value); // number | boolean
};

/**
 * Resolves `${...}` references in a filter value and serializes it to a GraphQL
 * literal. Substitution uses an identity encoder (not the URL-encoding default),
 * because the value is escaped again as a GraphQL literal below.
 */
const resolveFilterValue = (value: GraphQLFilterValue, variables: SuggestionVariables): string => {
  if (typeof value === "string") {
    return serializeGraphQLValue(substituteVariables(value, variables, (raw) => raw));
  }

  return serializeGraphQLValue(value);
};

/**
 * Extracts the top-level GraphQL field a projection path reads from, so it can be
 * added to the selection set (e.g. `candidate_attributes.network_name` selects
 * `candidate_attributes`, `id` selects `id`). Returns null when the path does not
 * start with a member (e.g. a leading array index), which cannot map to a field.
 */
const topLevelField = (path: string): string | null => {
  const member = path
    .trim()
    .replace(/^\$/, "")
    .replace(/^\./, "")
    .match(/^[A-Za-z_][A-Za-z0-9_]*/);

  return member ? member[0] : null;
};

/**
 * The GraphQL fields to request, derived from the projection paths. Deduplicated
 * and order-stable (value before label).
 */
const selectionFields = ({ label, value }: GraphQLSuggestionQuery): string[] => {
  const fields = [value, ...(label ? [label] : [])]
    .map(topLevelField)
    .filter((field): field is string => field !== null);

  return [...new Set(fields)];
};

/**
 * Builds the runtime GraphQL query string for a `graphql` suggestion.
 *
 * @param query - The annotation's query declaration.
 * @param variables - Values for `${...}` filter references, keyed by namespace.
 * @returns A GraphQL query string targeting a Relay connection root.
 */
export const buildSuggestionQuery = (
  query: GraphQLSuggestionQuery,
  variables: SuggestionVariables
): string => {
  const filterEntries = Object.entries(query.filter ?? {});
  const filterArgument =
    filterEntries.length > 0
      ? `filter: {${filterEntries
          .map(([key, value]) => `${key}: ${resolveFilterValue(value, variables)}`)
          .join(", ")}}, `
      : "";
  const fields = selectionFields(query).join(" ");

  return `query { ${query.root}(${filterArgument}first: ${SUGGESTION_PAGE_SIZE}) { edges { node { ${fields} } } } }`;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

/**
 * Pulls the nodes out of a Relay connection response for `root`. `useGraphQLRequest`
 * hands back the GraphQL envelope `{ data: { <root>: ... } }` (read via
 * `data.data.<root>`, like `useGetEnvironmentPreview`/`useGetResources`). Any
 * missing/malformed shape - including the `{ data: null }` of an errored query -
 * collapses to an empty list instead of throwing.
 */
export const extractNodes = (data: unknown, root: string): unknown[] => {
  const response = asRecord(data);
  const container = response && asRecord(response.data);
  const connection = container && asRecord(container[root]);
  const edges = connection?.edges;
  if (!Array.isArray(edges)) {
    return [];
  }

  return edges.map((edge) => asRecord(edge)?.node);
};

/**
 * Projects each node into a raw suggestion via the shared jsonpath evaluator. A
 * node is dropped when its `value` path yields no single scalar; a declared
 * `label` is projected too, falling back to the value when it yields no scalar.
 * Output stays {@link RawFormSuggestion} for `normalizeSuggestions` to coerce, like
 * the other flavors.
 */
export const projectNodes = (
  nodes: unknown[],
  { label, value }: GraphQLSuggestionQuery
): RawFormSuggestion[] =>
  nodes.reduce<RawFormSuggestion[]>((acc, node) => {
    const valueResult = JsonPath.evaluate(node, value);
    if (Maybe.isNone(valueResult) || !isStringOrNumber(valueResult.value)) {
      return acc;
    }
    const resolvedValue = valueResult.value;

    if (label === undefined) {
      acc.push(resolvedValue);

      return acc;
    }

    const labelResult = JsonPath.evaluate(node, label);
    const resolvedLabel =
      Maybe.isSome(labelResult) && isStringOrNumber(labelResult.value)
        ? labelResult.value
        : resolvedValue;
    acc.push({ label: resolvedLabel, value: resolvedValue });

    return acc;
  }, []);

/**
 * The `${...}` namespaces referenced across all filter values, deduplicated.
 * Mirrors `extractVariables` for the parameters flavor, so the hook can gate the
 * fetch on their presence and flag unknown ones as a model error.
 */
export const getFilterVariables = (query: GraphQLSuggestionQuery): string[] => {
  const namespaces = new Set<string>();

  for (const value of Object.values(query.filter ?? {})) {
    if (typeof value === "string") {
      extractVariables(value).forEach((namespace) => namespaces.add(namespace));
    }
  }

  return [...namespaces];
};

/**
 * The projection paths (`label`/`value`) that fall outside the evaluator's
 * supported navigational subset. A non-empty result means the annotation is
 * broken and should surface as a model error rather than silently yield nothing.
 */
export const getUnsupportedPaths = (query: GraphQLSuggestionQuery): string[] =>
  [query.value, ...(query.label ? [query.label] : [])].filter(
    (path) => !JsonPath.isSupportedPath(path)
  );
