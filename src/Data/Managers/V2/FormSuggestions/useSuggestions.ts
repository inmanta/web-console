import { useQuery } from "@tanstack/react-query";
import { FormSuggestion } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

/**
 * Custom hook to handle suggested values for a parameter.
 * If the suggestions are literal, it will return the values directly.
 * If the suggestions are parameters, it will fetch the parameter from the API.
 * if the suggestions are null or undefined, it will return null as data, and a success status.
 *
 * @param suggestions - The suggestions for the parameter.
 * @param environment - The environment for the parameter.
 *
 * @returns The result of the query, {data, status, error, isLoading}.
 */
export const useSuggestedValues = (
  suggestions: FormSuggestion | null | undefined,
  environment: string,
) => {
  //extracted headers to avoid breaking rules of Hooks
  const headers = useCreateHeaders(environment);
  const { handleAuthorization } = useHandleErrors();
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
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const fetchParameter = async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/parameter/${suggestions.parameter_name}`,
      {
        headers,
      },
    );
    handleAuthorization(response);

    if (!response.ok) {
      throw new Error("Failed to fetch parameter");
    }
    return response.json();
  };

  return {
    /**
     * Custom hook to fetch the parameter from the API once.
     * @returns The result of the query, including the parameter data.
     */
    useOneTime: () =>
      useQuery({
        queryKey: [
          "get_parameter-one_time",
          suggestions.parameter_name,
          environment,
        ],
        queryFn: fetchParameter,
        retry: false,
        select: (data) => data.parameter,
      }),
  };
};
