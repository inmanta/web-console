import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormSuggestion } from "@/Core";
import { useGet, getParametersKey, useGraphQLRequest } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
import { useDebounce } from "@/UI/Utils";
import { words } from "@/UI/words";
import {
  buildSuggestionQuery,
  extractNodes,
  getFilterVariables,
  getInvalidFilterKeys,
  getUnsupportedPaths,
  projectNodes,
} from "./graphqlSuggestions";
import { normalizeSuggestions } from "./helpers";
import {
  SUGGESTION_NAMESPACES,
  SuggestionVariables,
  extractVariables,
  getUnknownNamespaces,
  isKnownNamespace,
  substituteVariables,
} from "./suggestionVariables";

interface ResponseData {
  parameter?: { metadata?: { values?: unknown } };
}

/**
 * React Query hook for a field's suggested values, normalized to `{ label, value }[]`:
 * literal values are normalized inline, parameters are fetched and normalized, and
 * null/undefined yields null data.
 *
 * A `parameter_name` may contain `${...}` variables resolved from `suggestionVariables`
 * before the fetch; the resolved name is the query key, so distinct values cache
 * separately. A required variable without a value (e.g. `${instance_id}` on a create
 * form) disables the query instead of fetching a malformed name. An unknown variable
 * is reported as `modelError` (never fetched) - distinct from the query `error`, a
 * genuine fetch failure that stays silent.
 *
 * @param suggestions - The field's suggestions.
 * @param suggestionVariables - Values for `${...}` variables, keyed by namespace.
 * @returns `{ useOneTime }` returning the query result plus `modelError`.
 */
export const useSuggestedValues = (
  suggestions: FormSuggestion | null | undefined,
  suggestionVariables: SuggestionVariables = {}
) => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<ResponseData>;

  if (!suggestions) {
    return {
      useOneTime: () => {
        return { data: null, error: null, isLoading: false, modelError: null };
      },
    };
  }

  if (suggestions.type === "literal") {
    return {
      useOneTime: () => {
        // Static for the field's lifetime; memoize once for a stable reference.
        const data = useMemo(() => normalizeSuggestions(suggestions.values), []);

        return { data, error: null, isLoading: false, modelError: null };
      },
    };
  }

  if (suggestions.type === "graphql") {
    const graphqlQuery = suggestions.query;

    if (!graphqlQuery || !graphqlQuery.root || !graphqlQuery.value) {
      return {
        useOneTime: () => ({
          data: null,
          error: null,
          isLoading: false,
          modelError: words("inventory.form.suggestions.invalidQuery"),
        }),
      };
    }

    const filterVariables = getFilterVariables(graphqlQuery);
    // Cascading `${form:...}` / `${self:...}` references (#7011) are not yet handled,
    // so until that lands they fall through here as unknown variables.
    const unknownNamespaces = filterVariables.filter((namespace) => !isKnownNamespace(namespace));
    const unsupportedPaths = getUnsupportedPaths(graphqlQuery);
    const invalidFilterKeys = getInvalidFilterKeys(graphqlQuery);
    // Broken annotations (unknown `${...}` namespace, non-navigational projection,
    // filter key that isn't a valid GraphQL field name) are model errors: reported
    // separately and never fetched.
    const modelError =
      unknownNamespaces.length > 0
        ? words("inventory.form.suggestions.unknownVariable")(
            unknownNamespaces.join(", "),
            SUGGESTION_NAMESPACES.join(", ")
          )
        : unsupportedPaths.length > 0
          ? words("inventory.form.suggestions.unsupportedPath")(unsupportedPaths.join(", "))
          : invalidFilterKeys.length > 0
            ? words("inventory.form.suggestions.invalidFilterKey")(invalidFilterKeys.join(", "))
            : null;

    return {
      useOneTime: () => {
        // Gate with `enabled` (not an early return) so hook order stays stable.
        // A filter referencing a value the form cannot provide yet (e.g.
        // `${instance_id}` on a create form) disables the query.
        const isResolvable =
          !modelError &&
          filterVariables.every(
            (namespace) => isKnownNamespace(namespace) && suggestionVariables[namespace]
          );
        const queryString = buildSuggestionQuery(graphqlQuery, suggestionVariables);
        // Debounce so a filter fed by a typed field re-queries on settle rather
        // than on every keystroke; the resolved query is the cache key.
        const debouncedQuery = useDebounce(queryString, 500);
        const fetchSuggestions = useGraphQLRequest<Record<string, unknown>>(debouncedQuery);

        const query = useQuery({
          queryKey: getGraphQLSuggestionsKey.single(graphqlQuery.root, [debouncedQuery, env]),
          queryFn: fetchSuggestions,
          select: (data) =>
            normalizeSuggestions(projectNodes(extractNodes(data, graphqlQuery.root), graphqlQuery)),
          enabled: isResolvable,
        });

        return { ...query, modelError };
      },
    };
  }

  const parameterName = suggestions.parameter_name || "";
  const variables = extractVariables(parameterName);
  const unknownNamespaces = getUnknownNamespaces(parameterName);
  // A broken annotation is a model error, not a fetch failure: reported separately
  // and never fetched, leaving `error` for genuine fetch failures.
  const modelError =
    unknownNamespaces.length > 0
      ? words("inventory.form.suggestions.unknownVariable")(
          unknownNamespaces.join(", "),
          SUGGESTION_NAMESPACES.join(", ")
        )
      : null;

  return {
    useOneTime: () => {
      // Gate with `enabled` (not an early return) so hook order stays stable as
      // form values change across renders.
      const isResolvable =
        !modelError &&
        variables.every(
          (namespace) => isKnownNamespace(namespace) && suggestionVariables[namespace]
        );
      const resolvedName = isResolvable
        ? substituteVariables(parameterName, suggestionVariables)
        : "";
      // Debounce values typed into a field (`${identifying_attribute}`) so they
      // re-query on settle; the seeded first value keeps static names instant.
      const debouncedName = useDebounce(resolvedName, 500);

      const query = useQuery({
        queryKey: getParametersKey.single(debouncedName || "no_parameter", [env]),
        queryFn: () => get(`/api/v1/parameter/${debouncedName}`),
        select: (data) => normalizeSuggestions(data.parameter?.metadata?.values),
        enabled: debouncedName !== "",
      });

      return { ...query, modelError };
    },
  };
};

export const getGraphQLSuggestionsKey = new KeyFactory(
  SliceKeys.serviceInstance,
  "graphql_suggestions"
);
