import { useQuery } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * Custom hook for getting a current user from the server.
 *
 * @returns {Query} - An object containing a custom hook to fetch user information.
 */
export const useGetCurrentUser = () => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  const currentUserOrder = async (): Promise<{
    data: {
      username: string;
    };
  }> => {
    const response = await fetch(baseUrl + `/api/v2/current_user/`, {
      headers: createHeaders(),
    });

    await handleErrors(response);

    return response.json();
  };

  return {
    /**
     * Custom hook to fetch the user information from the API once.
     * @returns The result of the query, including the current user information.
     */
    useOneTime: () =>
      useQuery({
        queryFn: currentUserOrder,
        queryKey: ["get_current_user"],
        select: (data) => data.data,
      }),
  };
};
