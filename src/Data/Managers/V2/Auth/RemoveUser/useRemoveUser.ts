import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeleteWithoutEnv } from "../../helpers";

/**
 * React Query hook for removing a user from the server.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useRemoveUser = (): UseMutationResult<void, Error, string, unknown> => {
  const client = useQueryClient();
  const deleteFn = useDeleteWithoutEnv();

  return useMutation({
    mutationFn: (username) => deleteFn(`/api/v2/user/${username}`),
    mutationKey: ["removeUser"],
    onSuccess: () => {
      // Refetch the users query to update the list
      client.invalidateQueries({ queryKey: ["get_users-one_time"] });
    },
  });
};
