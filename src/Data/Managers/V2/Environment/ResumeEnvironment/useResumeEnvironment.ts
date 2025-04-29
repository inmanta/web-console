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
  options?: UseMutationOptions<void, Error, void>
): UseMutationResult<void, Error, void> => {
  const client = useQueryClient();
  const post = usePost();

  return useMutation({
    mutationFn: () => post("/api/v2/actions/environment/resume", null),
    mutationKey: ["resume_environment"],
    onSuccess: () => {
      client.resetQueries();
    },
    ...options,
  });
};
