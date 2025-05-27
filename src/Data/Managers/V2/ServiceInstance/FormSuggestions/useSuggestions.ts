import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { FormSuggestion } from "@/Core";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { DependencyContext } from "@/UI/Dependency";
import { useGet } from "../../helpers";

interface ResponseData {
  parameter: Record<string, Record<string, unknown>>;
}

/**
 * React Query hook to handle suggested values for a parameter.
 * If the suggestions are literal, it will return the values directly.
 * If the suggestions are parameters, it will fetch the parameter from the API.
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
        return {
          data: suggestions.values,
          status: "success",
          error: null,
          isLoading: false,
        };
      },
    };
  }

  const keyFactory = new KeyFactory(keySlices.parameters, "get_parameter");

  return {
    /**
     * Custom hook to fetch the parameter from the API once.
     * @returns The result of the query, including the parameter data.
     */
    useOneTime: () =>
      useQuery({
        queryKey: keyFactory.single(suggestions.parameter_name || "", [env]),
        queryFn: () => get(`/api/v1/parameter/${suggestions.parameter_name}`),
        select: (data) => data.parameter,
      }),
  };
};
