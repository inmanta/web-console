import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { useDeleteWithoutEnv } from "@/Data/Queries";

/**
 * React Query hook for clearing (decommissioning) an environment.
 *
 * @returns {UseMutationResult<void, Error, void, unknown>} The mutation object for clearing an environment.
 */
export const useClearEnvironment = (
  environmentId: string,
  options?: UseMutationOptions<void, Error, void>
): UseMutationResult<void, Error, void> => {
  const deleteFn = useDeleteWithoutEnv();

  return useMutation({
    mutationFn: () => deleteFn(`/api/v2/decommission/${environmentId}`),
    mutationKey: ["clear_environment"],
    ...options,
  });
};
