import { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormSuggestion } from "@/Core";
import { useGet, getParametersKey } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { normalizeSuggestions } from "./helpers";

interface ResponseData {
  parameter?: { metadata?: { values?: unknown } };
}

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
