import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePost } from "../../helpers";

/**
 * React Query hook for resuming an environment.
 *
 * @returns {UseMutationResult<void, Error, void, unknown>} The mutation object for resuming an environment.
 */
export const useResumeEnvironment = (
  options?: UseMutationOptions<void, Error, void>,
): UseMutationResult<void, Error, void> => {
  const client = useQueryClient();
  const post = usePost();

  return useMutation({
    mutationFn: () => post("/api/v2/actions/environment/resume", null),
    mutationKey: ["resume_environment"],
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["get_environments-one_time"] });
      client.invalidateQueries({ queryKey: ["get_environments-continuous"] });
      client.invalidateQueries({
        queryKey: ["get_environment_details-one_time"],
      });
      client.invalidateQueries({
        queryKey: ["get_environment_details-continuous"],
      });
    },
    ...options,
  });
};
