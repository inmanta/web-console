import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDelete } from "../../helpers";

/**
 * React Query hook for deleting callback of given id
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDeleteCallback = (
  options?: UseMutationOptions<void, Error, string, unknown>
): UseMutationResult<void, Error, string, unknown> => {
  const client = useQueryClient();
  const deleteFn = useDelete();

  return useMutation({
    mutationFn: (id) => deleteFn(`/lsm/v1/callbacks/${id}`),
    mutationKey: ["delete_callback"],
    onSuccess: () => {
      //invalidate the get_callbacks query to update the list
      client.invalidateQueries({
        queryKey: ["get_callbacks-one_time"],
      });
    },
    ...options,
  });
};
