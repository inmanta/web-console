import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { PrimaryBaseUrlManager } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * React Query hook for removing a user from the server.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useRemoveUser = (): UseMutationResult<
  void,
  Error,
  string,
  unknown
> => {
  const client = useQueryClient();
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
   * @returns {Promise<void>} - A promise that resolves when the user is successfully removed.
   */
  const deleteOrder = async (username: string): Promise<void> => {
    const response = await fetch(baseUrl + `/api/v2/user/${username}`, {
      method: "DELETE",
      headers: createHeaders(),
    });

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: deleteOrder,
    mutationKey: ["removeUser"],
    onSuccess: () => {
      // Refetch the users query to update the list
      client.invalidateQueries({ queryKey: ["get_users-one_time"] });
    },
  });
};
