import { useContext, useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FormSuggestion, Maybe } from "@/Core";
import { useGet, getParametersKey, useGraphQLRequest } from "@/Data/Queries";
import { KeyFactory, SliceKeys } from "@/Data/Queries/Helpers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
import { useDebounce } from "@/UI/Utils";
import { words } from "@/UI/words";
import {
  FieldScopes,
  collectSuggestionReferences,
  getUnsupportedFieldPaths,
  resolveFieldReference,
} from "./fieldReferences";
import {
  buildSuggestionQuery,
  extractNodes,
  getInvalidFilterKeys,
  getUnsupportedPaths,
  projectNodes,
} from "./graphqlSuggestions";
import { normalizeSuggestions } from "./helpers";
import {
  ParsedReference,
  SUGGESTION_NAMESPACES,
  SubstitutionValues,
  SuggestionVariables,
  substituteVariables,
} from "./suggestionVariables";

/**
 * The suggestions hook: one entry point (`useSuggestedValues`) that turns a field's suggestion
 * annotation into a normalized `{ label, value }[]`, across all three flavors:
 *
 *   literal      values inline from the annotation (no fetch)
 *   parameters   fetch `/api/v1/parameter/<name>` (REST); the name may carry ${...} refs
 *   graphql      build + run a GraphQL query, project each node into label/value
 *
 * Before any fetch it resolves the suggestion's ${...} references (context vars + cascading
 * ${form.*}/${self.*}); the resolved name/query is the React Query key, an unresolvable ref
 * disables the fetch, an unresolved field dependency also blocks the control, and a broken
 * annotation surfaces as `modelError` (never fetched).
 */

interface ResponseData {
  parameter?: { metadata?: { values?: unknown } };
}

/**
 * The default field scopes for a caller with no cascading references: both roots undefined,
 * so any `${form.*}`/`${self.*}` reference fails to resolve and blocks rather than throwing.
 */
const NO_FIELD_SCOPES: FieldScopes = { form: undefined, self: undefined };

/**
 * The outcome of resolving a suggestion's `${...}` references. `substitution` maps every
 * reference to its value; `isResolvable` means safe to fetch; `isBlocked` means a cascading
 * dependency has no value yet; `referenceError` is a model error from the references alone.
 */
interface ResolvedReferences {
  substitution: SubstitutionValues;
  isResolvable: boolean;
  isBlocked: boolean;
  referenceError: string | null;
}

/**
 * Resolves a suggestion's `${...}` references in one pass shared by both flavors: context
 * namespaces from `contextValues`, `${form.*}`/`${self.*}` from `fieldScopes` via jsonpath.
 * An absent context value yields no suggestions but does not block; an unresolved field
 * dependency blocks the control.
 *
 * @example
 * resolveReferences(refs, { entity_type: "network" }, { form: { site: "a" }, self: {} }) // => { isResolvable: true, isBlocked: false, ... }
 */
const resolveReferences = (
  references: ParsedReference[],
  contextValues: SubstitutionValues,
  fieldScopes: FieldScopes
): ResolvedReferences => {
  const substitution: SubstitutionValues = { ...contextValues };
  const unknown: string[] = [];
  let hasFieldReference = false;
  let hasUnresolvedField = false;
  let hasUnresolvedContext = false;

  for (const reference of references) {
    if (reference.kind === "Unknown") {
      unknown.push(reference.raw);
    } else if (reference.kind === "Context") {
      if (!contextValues[reference.namespace]) {
        hasUnresolvedContext = true;
      }
    } else {
      hasFieldReference = true;
      const resolved = resolveFieldReference(reference, fieldScopes);

      if (Maybe.isSome(resolved)) {
        substitution[reference.raw] = resolved.value;
      } else {
        hasUnresolvedField = true;
      }
    }
  }

  const unsupportedFieldPaths = getUnsupportedFieldPaths(references);
  const referenceError =
    unknown.length > 0
      ? words("inventory.form.suggestions.unknownVariable")(
          unknown.join(", "),
          SUGGESTION_NAMESPACES.join(", ")
        )
      : unsupportedFieldPaths.length > 0
        ? words("inventory.form.suggestions.unsupportedFieldPath")(unsupportedFieldPaths.join(", "))
        : null;

  return {
    substitution,
    isResolvable: !referenceError && !hasUnresolvedContext && !hasUnresolvedField,
    isBlocked: !referenceError && hasFieldReference && hasUnresolvedField,
    referenceError,
  };
};

/**
 * React Query hook for a field's suggested values, normalized to `{ label, value }[]`:
 * literal inline, parameters fetched, graphql built and projected. `${...}` references
 * resolve first (context vars from `suggestionVariables` + cascading `${form.*}`/`${self.*}`
 * from `fieldScopes`); an unresolvable reference disables the fetch, an unresolved field
 * dependency also sets `isBlocked`, and an unknown/unsupported reference is a `modelError`.
 *
 * @example
 * useSuggestedValues(field.suggestion, { entity_type: "network" }, fieldScopes).useOneTime() // => { data, isBlocked, isRefreshing, modelError, ... }
 */
export const useSuggestedValues = (
  suggestions: FormSuggestion | null | undefined,
  suggestionVariables: SuggestionVariables = {},
  fieldScopes: FieldScopes = NO_FIELD_SCOPES
) => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<ResponseData>;
  // Fill `${environment}` with the active env UUID (FE-supplied, not form-derived);
  // it overrides any caller value so an author can scope roots like `resources`
  // without knowing the id.
  const resolvedVariables: SuggestionVariables = { ...suggestionVariables, environment: env };

  // The `${...}` references a suggestion declares are structural: they change only with the
  // annotation, never with the form's values. Memoize them so this parsing runs once per
  // suggestion instead of on every keystroke across every field. Kept before the early returns
  // below so the hook order stays stable.
  const references = useMemo(() => collectSuggestionReferences(suggestions), [suggestions]);

  if (!suggestions) {
    return {
      useOneTime: () => ({
        data: null,
        error: null,
        isLoading: false,
        isFetching: false,
        modelError: null,
        isBlocked: false,
        isRefreshing: false,
      }),
    };
  }

  if (suggestions.type === "literal") {
    return {
      useOneTime: () => {
        // Static for the field's lifetime; memoize once for a stable reference.
        const data = useMemo(() => normalizeSuggestions(suggestions.values), []);

        return {
          data,
          error: null,
          isLoading: false,
          isFetching: false,
          modelError: null,
          isBlocked: false,
          isRefreshing: false,
        };
      },
    };
  }

  const { substitution, isResolvable, isBlocked, referenceError } = resolveReferences(
    references,
    resolvedVariables,
    fieldScopes
  );

  if (suggestions.type === "graphql") {
    const graphqlQuery = suggestions.query;

    if (!graphqlQuery || !graphqlQuery.root || !graphqlQuery.value) {
      return {
        useOneTime: () => ({
          data: null,
          error: null,
          isLoading: false,
          isFetching: false,
          modelError: words("inventory.form.suggestions.invalidQuery"),
          isBlocked: false,
          isRefreshing: false,
        }),
      };
    }

    const unsupportedPaths = getUnsupportedPaths(graphqlQuery);
    const invalidFilterKeys = getInvalidFilterKeys(graphqlQuery);
    // Broken annotations (unknown/unsupported reference, non-navigational projection,
    // filter key that isn't a valid GraphQL field name) are model errors: reported
    // separately and never fetched.
    const modelError =
      referenceError ??
      (unsupportedPaths.length > 0
        ? words("inventory.form.suggestions.unsupportedPath")(unsupportedPaths.join(", "))
        : invalidFilterKeys.length > 0
          ? words("inventory.form.suggestions.invalidFilterKey")(invalidFilterKeys.join(", "))
          : null);

    return {
      useOneTime: () => {
        const queryString = buildSuggestionQuery(graphqlQuery, substitution);
        // Debounce so a filter fed by a typed field re-queries on settle rather
        // than on every keystroke; the resolved query is the cache key.
        const debouncedQuery = useDebounce(queryString, 500);
        const fetchSuggestions = useGraphQLRequest<Record<string, unknown>>(debouncedQuery);

        const query = useQuery({
          queryKey: getGraphQLSuggestionsKey.single(graphqlQuery.root, [debouncedQuery, env]),
          queryFn: fetchSuggestions,
          select: (data) =>
            normalizeSuggestions(projectNodes(extractNodes(data, graphqlQuery.root), graphqlQuery)),
          // Gate with `enabled` (not an early return) so hook order stays stable. A
          // reference the form cannot provide yet (a create-form `${instance_id}`, or a
          // cascading source without a value) disables the query.
          enabled: isResolvable && !modelError,
          // Keep the previous source's options while the new ones load, so the shown label
          // doesn't flash to its raw value between a source change and the refreshed list.
          placeholderData: keepPreviousData,
          // The resolved query string is the freshness boundary: identical query = identical
          // result for the form's lifetime. Marking it fresh stops a background refetch when a
          // second field subscribes to the same key, which would otherwise toggle `isFetching`
          // on the shared cache entry and flash every field sharing that query.
          staleTime: Infinity,
        });

        // A source change has not reached the query until the debounce settles: during that
        // window the resolved query differs from the one being fetched, so its cached data is
        // stale. Combined with the query's own `isFetching`, this is the field's "busy" window.
        const isRefreshing = queryString !== debouncedQuery;

        return { ...query, modelError, isBlocked, isRefreshing };
      },
    };
  }

  const parameterName = suggestions.parameter_name || "";
  const modelError = referenceError;

  return {
    useOneTime: () => {
      const resolvedName = isResolvable ? substituteVariables(parameterName, substitution) : "";
      // Debounce values typed into a field (`${identifying_attribute}`, a cascading
      // source) so they re-query on settle; the seeded first value keeps static names
      // instant.
      const debouncedName = useDebounce(resolvedName, 500);

      const query = useQuery({
        queryKey: getParametersKey.single(debouncedName || "no_parameter", [env]),
        queryFn: () => get(`/api/v1/parameter/${debouncedName}`),
        select: (data) => normalizeSuggestions(data.parameter?.metadata?.values),
        enabled: debouncedName !== "",
        // Keep the previous source's options while the new ones load, so the shown label
        // doesn't flash to its raw value between a source change and the refreshed list.
        placeholderData: keepPreviousData,
        // The resolved parameter name is the freshness boundary: identical name = identical
        // result for the form's lifetime. Marking it fresh stops a background refetch when a
        // second field subscribes to the same key, which would otherwise toggle `isFetching`
        // on the shared cache entry and flash every field sharing that query.
        staleTime: Infinity,
      });

      // A source change has not reached the query until the debounce settles: during that
      // window the resolved name differs from the one being fetched, so its cached data is
      // stale. Combined with the query's own `isFetching`, this is the field's "busy" window.
      const isRefreshing = resolvedName !== debouncedName;

      return { ...query, modelError, isBlocked, isRefreshing };
    },
  };
};

export const getGraphQLSuggestionsKey = new KeyFactory(
  SliceKeys.serviceInstance,
  "graphql_suggestions"
);
