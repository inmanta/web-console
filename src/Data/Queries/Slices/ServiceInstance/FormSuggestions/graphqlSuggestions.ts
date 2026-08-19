import {
  GraphQLFilterValue,
  GraphQLSuggestionQuery,
  JsonPath,
  Maybe,
  RawFormSuggestion,
} from "@/Core";
import { isStringOrNumber } from "./helpers";
import { SubstitutionValues, substituteVariables } from "./suggestionVariables";

/**
 * The `graphql` suggestion flavor: its query is generated from annotation data at runtime
 * rather than a static `gql`. Two languages meet - `filter` keys are camelCase GraphQL fields
 * (sent to the server); `label`/`value` are jsonpath projections into each returned node
 * (evaluated client-side).
 *
 *   buildSuggestionQuery   query decl + resolved ${...} values -> a GraphQL query string
 *   extractNodes           GraphQL response -> the Relay connection's nodes ([] on any bad shape)
 *   projectNodes           nodes -> raw {label,value} suggestions (jsonpath, drops non-scalars)
 *   getInvalidFilterKeys   query decl -> filter keys that aren't valid GraphQL names (model error)
 *   getUnsupportedPaths    query decl -> label/value paths we can't evaluate (model error)
 */

/** A valid GraphQL name; a `filter` key is emitted as one, so it must match. */
const GRAPHQL_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Serializes a filter value into GraphQL argument syntax, resolving `${...}` in string
 * leaves as it goes. Strings are `JSON.stringify`d (an escaped literal, so a form-supplied
 * value can't break out of the query); numbers/booleans/null are bare; arrays and objects
 * recurse. Injection-safe at any depth: only structural tokens and primitives are emitted
 * unquoted, never a data-derived string.
 *
 * @example
 * serializeFilterValue({ contains: ["%${form.site}%"] }, { "form.site": "a" }) // => '{contains: ["%a%"]}'
 */
const serializeFilterValue = (value: GraphQLFilterValue, variables: SubstitutionValues): string => {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    // identity encoder: JSON.stringify escapes it as a GraphQL literal below
    return JSON.stringify(substituteVariables(value, variables, (raw) => raw));
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => serializeFilterValue(item, variables)).join(", ")}]`;
  }

  return `{${Object.entries(value)
    .map(([key, nested]) => `${key}: ${serializeFilterValue(nested, variables)}`)
    .join(", ")}}`;
};

/**
 * The GraphQL fields to request, derived from each projection path's root member,
 * deduplicated and order-stable (value before label).
 *
 * @example
 * selectionFields({ value: "id", label: "candidate_attributes.name" }) // => ["id", "candidate_attributes"]
 */
const selectionFields = ({ label, value }: GraphQLSuggestionQuery): string[] => {
  const fields = [value, ...(label ? [label] : [])]
    .map(JsonPath.rootMember)
    .filter((field): field is string => field !== null);

  return [...new Set(fields)];
};

/**
 * Builds the runtime GraphQL query string for a `graphql` suggestion, targeting a Relay
 * connection root. Omits the argument list when there is no filter.
 *
 * @example
 * buildSuggestionQuery({ root: "environments", value: "id" }, {}) // => "query { environments { edges { node { id } } } }"
 */
export const buildSuggestionQuery = (
  query: GraphQLSuggestionQuery,
  variables: SubstitutionValues
): string => {
  const filterEntries = Object.entries(query.filter ?? {});
  // Omit the argument list entirely when there is no filter: `root()` is invalid
  // GraphQL. Paging/ordering are left to the author's query, not imposed here.
  const args =
    filterEntries.length > 0
      ? `(filter: {${filterEntries
          .map(([key, value]) => `${key}: ${serializeFilterValue(value, variables)}`)
          .join(", ")}})`
      : "";
  const fields = selectionFields(query).join(" ");

  return `query { ${query.root}${args} { edges { node { ${fields} } } } }`;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;

/**
 * Pulls the nodes out of a Relay connection response for `root` (read via the envelope
 * `data.data.<root>.edges[].node`). Any missing or malformed shape collapses to `[]`.
 *
 * @example
 * extractNodes({ data: { environments: { edges: [{ node: { id: "e1" } }] } } }, "environments") // => [{ id: "e1" }]
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
 * Projects each node into a raw suggestion by jsonpath: a node is dropped when its `value`
 * path yields no single scalar, and a declared `label` falls back to the value when it does.
 *
 * @example
 * projectNodes([{ id: "e1", name: "prod" }], { value: "id", label: "name" }) // => [{ label: "prod", value: "e1" }]
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
 * The filter keys at any depth that are not valid GraphQL names (the usual mistake is a
 * dotted jsonpath used as a filter key) - a non-empty result is a model error.
 *
 * @example
 * getInvalidFilterKeys({ root: "r", value: "id", filter: { "a.b": 1 } }) // => ["a.b"]
 */
export const getInvalidFilterKeys = (query: GraphQLSuggestionQuery): string[] => {
  const invalid: string[] = [];
  const walk = (value: GraphQLFilterValue): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (typeof value === "object" && value !== null) {
      for (const [key, nested] of Object.entries(value)) {
        if (!GRAPHQL_NAME_PATTERN.test(key)) {
          invalid.push(key);
        }
        walk(nested);
      }
    }
  };

  walk(query.filter ?? {});

  return invalid;
};

/**
 * The projection paths (`label`/`value`) that fall outside the evaluator's supported
 * navigational subset - a non-empty result is a model error.
 *
 * @example
 * getUnsupportedPaths({ root: "r", value: "items[*].id" }) // => ["items[*].id"]
 */
export const getUnsupportedPaths = (query: GraphQLSuggestionQuery): string[] =>
  [query.value, ...(query.label ? [query.label] : [])].filter(
    (path) => !JsonPath.isSupportedPath(path)
  );
