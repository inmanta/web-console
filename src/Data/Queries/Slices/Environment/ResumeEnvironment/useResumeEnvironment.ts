import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { DependencyContext } from "@/UI";
import { usePost } from "@/Data/Queries/Helpers";

/**
 * React Query hook for resuming an environment.
 *
 * @returns {UseMutationResult<void, Error, void, unknown>} The mutation object for resuming an environment.
 */
export const useResumeEnvironment = (
  options?: UseMutationOptions<void, Error, void>
): UseMutationResult<void, Error, void> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env);

  return useMutation({
    mutationFn: () => post("/api/v2/actions/environment/resume", null),
    mutationKey: ["resume_environment", env],
    ...options,
  });
};
