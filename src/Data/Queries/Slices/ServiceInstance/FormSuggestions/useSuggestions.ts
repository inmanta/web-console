import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormSuggestion, SuggestionValue } from "@/Core";
import { useGet, getParametersKey } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";

interface ResponseData {
  parameter?: { metadata?: { values?: unknown } };
}

/**
 * Type guard for a string or number scalar.
 *
 * @param value - The value to check.
 * @returns Whether the value is a string or a number.
 */
const isStringOrNumber = (value: unknown): value is string | number =>
  typeof value === "string" || typeof value === "number";

/**
 * Type guard for an explicit `{ label, value }` suggestion pair.
 *
 * Both fields may be a string or a number (e.g. numeric attributes); they are
 * coerced to strings when normalized.
 *
 * @param entry - The raw entry to check.
 * @returns Whether the entry is a `{ label, value }` pair of scalars.
 */
const isLabelValuePair = (
  entry: unknown
): entry is { label: string | number; value: string | number } =>
  typeof entry === "object" &&
  entry !== null &&
  "label" in entry &&
  "value" in entry &&
  isStringOrNumber(entry.label) &&
  isStringOrNumber(entry.value);

/**
 * Normalizes a raw list of suggestion entries into a single `{ label, value }[]` shape.
 *
 * Every flavor (literal, parameters, ...) is reduced to this shape so the rest
 * of the form only deals with one contract. A bare scalar normalizes to a pair
 * where `label === value`; an explicit pair has its (possibly numeric) fields
 * coerced to strings; anything else is dropped.
 *
 * @param values - The raw values, of unknown shape.
 * @returns The normalized suggestions, or null when `values` is not an array.
 */
export const normalizeSuggestions = (values: unknown): SuggestionValue[] | null => {
  if (!Array.isArray(values)) {
    return null;
  }

  return values.reduce<SuggestionValue[]>((acc, entry) => {
    if (isStringOrNumber(entry)) {
      acc.push({ label: String(entry), value: String(entry) });
    } else if (isLabelValuePair(entry)) {
      acc.push({ label: String(entry.label), value: String(entry.value) });
    }

    return acc;
  }, []);
};

/**
 * React Query hook to handle suggested values for a parameter.
 * Every flavor is normalized to a single `{ label, value }[]` shape:
 * If the suggestions are literal, it normalizes the inline values.
 * If the suggestions are parameters, it fetches the parameter from the API and normalizes its values.
 * if the suggestions are null or undefined, it will return null as data, and a success status.
 *
 * @param suggestions - The suggestions for the parameter.
 *
 * @returns The result of the query, {data, status, error, isLoading}.
 */
export const useSuggestedValues = (suggestions: FormSuggestion | null | undefined) => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const get = useGet(env)<ResponseData>;

  if (!suggestions) {
    return {
      useOneTime: () => {
        return { data: null, status: "success", error: null, isLoading: false };
      },
    };
  }

  if (suggestions.type === "literal") {
    return {
      useOneTime: () => {
        // A field's literal values are static for its lifetime, so memoizing
        // once keeps the normalized array referentially stable across renders.
        const data = useMemo(() => normalizeSuggestions(suggestions.values), []);

        return {
          data,
          status: "success",
          error: null,
          isLoading: false,
        };
      },
    };
  }

  return {
    /**
     * Custom hook to fetch the parameter from the API once.
     * @returns The result of the query, including the normalized suggestions.
     */
    useOneTime: () =>
      useQuery({
        queryKey: getParametersKey.single(suggestions.parameter_name || "no_parameter", [env]),
        queryFn: () => get(`/api/v1/parameter/${suggestions.parameter_name}`),
        select: (data) => normalizeSuggestions(data.parameter?.metadata?.values),
      }),
  };
};
