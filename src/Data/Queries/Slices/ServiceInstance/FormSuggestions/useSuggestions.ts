import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormSuggestion } from "@/Core";
import { useGet, getParametersKey } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { useDebounce } from "@/UI/Utils";
import { words } from "@/UI/words";
import { normalizeSuggestions } from "./helpers";
import {
  TEMPLATE_NAMESPACES,
  TemplateContext,
  extractVariables,
  getUnknownNamespaces,
  isKnownNamespace,
  substituteVariables,
} from "./templateVariables";

interface ResponseData {
  parameter?: { metadata?: { values?: unknown } };
}

/**
 * React Query hook for a field's suggested values, normalized to `{ label, value }[]`:
 * literal values are normalized inline, parameters are fetched and normalized, and
 * null/undefined yields null data.
 *
 * A `parameter_name` may contain `${...}` variables resolved from `templateContext`
 * before the fetch; the resolved name is the query key, so distinct contexts cache
 * separately. A required variable without a value (e.g. `${instance_id}` on a create
 * form) disables the query instead of fetching a malformed name. An unknown variable
 * is reported as `modelError` (never fetched) - distinct from the query `error`, a
 * genuine fetch failure that stays silent.
 *
 * @param suggestions - The field's suggestions.
 * @param templateContext - Values for `${...}` variables, keyed by namespace.
 * @returns `{ useOneTime }` returning the query result plus `modelError`.
 */
export const useSuggestedValues = (
  suggestions: FormSuggestion | null | undefined,
  templateContext: TemplateContext = {}
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

  const template = suggestions.parameter_name || "";
  const variables = extractVariables(template);
  const unknownNamespaces = getUnknownNamespaces(template);
  // A broken annotation is a model error, not a fetch failure: reported separately
  // and never fetched, leaving `error` for genuine fetch failures.
  const modelError =
    unknownNamespaces.length > 0
      ? words("inventory.form.suggestions.unknownVariable")(
          unknownNamespaces.join(", "),
          TEMPLATE_NAMESPACES.join(", ")
        )
      : null;

  return {
    useOneTime: () => {
      // Gate with `enabled` (not an early return) so hook order stays stable as
      // form values change across renders.
      const isResolvable =
        !modelError &&
        variables.every(
          ({ namespace }) => isKnownNamespace(namespace) && templateContext[namespace]
        );
      const resolvedName = isResolvable ? substituteVariables(template, templateContext) : "";
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
