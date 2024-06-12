import { useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DependencyContext, PrimaryBaseUrlManager } from "@/UI";
import { useCreateHeaders } from "../helpers/useCreateHeaders";

/**
 * Custom hook for removing a user from the server.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useRemoveUser = () => {
  const client = useQueryClient();
  const headers = useCreateHeaders();
  const { useAuth } = useContext(DependencyContext);

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
      headers,
    });
    if (response.status === 401) {
      useAuth.login();
    }
    if (!response.ok) {
      throw new Error(JSON.parse(await response.text()).message);
    }
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
