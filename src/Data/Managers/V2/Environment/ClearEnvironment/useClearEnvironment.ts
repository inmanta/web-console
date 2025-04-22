import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDelete } from "../../helpers";

/**
 * React Query hook for clearing (decommissioning) an environment.
 *
 * @returns {UseMutationResult<void, Error, string, unknown>} The mutation object for clearing an environment.
 */
export const useClearEnvironment = (
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> => {
  const client = useQueryClient();
  const deleteFn = useDelete();

  return useMutation({
    mutationFn: (environmentId) => deleteFn(`/api/v2/decommission/${environmentId}`),
    mutationKey: ["clear_environment"],
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["get_environments-one_time"] });
      client.invalidateQueries({ queryKey: ["get_environments-continuous"] });
    },
    ...options,
  });
};
