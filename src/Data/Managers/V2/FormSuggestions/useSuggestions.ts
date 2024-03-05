import { useQuery } from "@tanstack/react-query";
import { FormSuggestion } from "@/Core";
import { PrimaryBaseUrlManager } from "@/UI";

/**
 * Custom hook to handle suggested values for a parameter.
 * @param suggestions - The suggestions for the parameter.
 * @param environment - The environment for the parameter.
 * @returns An object containing custom hooks to fetch the parameter data.
 */
export const useSuggestedValues = (
  suggestions: FormSuggestion | null | undefined,
  environment: string,
) => {
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
        headers: new Headers({
          "X-Inmanta-Tid": environment,
        }),
      },
    );

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
