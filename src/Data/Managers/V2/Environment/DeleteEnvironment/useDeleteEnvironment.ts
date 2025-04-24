import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { useDeleteWithoutEnv } from "../../helpers";

/**
 * React Query hook for deleting an environment.
 *
 * @returns {UseMutationResult<void, Error, void, unknown>} The mutation object for deleting an environment.
 */
export const useDeleteEnvironment = (
  environmentId: string,
  options?: UseMutationOptions<void, Error, void>
): UseMutationResult<void, Error, void> => {
  const deleteFn = useDeleteWithoutEnv();

  return useMutation({
    mutationFn: () => deleteFn(`/api/v2/environment/${environmentId}`),
    mutationKey: ["delete_environment", environmentId],
    ...options,
  });
};
