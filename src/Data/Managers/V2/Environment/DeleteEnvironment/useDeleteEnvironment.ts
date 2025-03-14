import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDelete } from "../../helpers";

/**
 * React Query hook for deleting an environment.
 *
 * @returns {UseMutationResult<void, Error, void, unknown>} The mutation object for deleting an environment.
 */
export const useDeleteEnvironment = (
  environmentId: string,
  options?: UseMutationOptions<void, Error, void>,
): UseMutationResult<void, Error, void> => {
  const client = useQueryClient();
  const deleteFn = useDelete();

  return useMutation({
    mutationFn: () => deleteFn(`/api/v2/environment/${environmentId}`),
    mutationKey: ["delete_environment", environmentId],
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["get_environments-one_time"] });
      client.invalidateQueries({ queryKey: ["get_environments-continuous"] });
    },
    ...options,
  });
};
