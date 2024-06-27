import { useQuery } from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * Custom hook for removing a user from the server.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useGetCurrentUser = () => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );

  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Deletes a user from the server.
   *
   * @param {string} username - The username of the user to be removed.
   * @returns {Promise<{}>} - A promise that resolves when the user is successfully removed.
   */
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
     * @returns The result of the query, including the user information.
     */
    useOneTime: () =>
      useQuery({
        queryFn: currentUserOrder,
        queryKey: ["get_current_user"],
        select: (data) => data.data,
      }),
  };
};
