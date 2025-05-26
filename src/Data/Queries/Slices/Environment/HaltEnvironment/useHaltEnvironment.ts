import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";

/**
 * React Query hook for halting an environment.
 *
 * @returns {UseMutationResult<void, Error, void, unknown>} The mutation object for halting an environment.
 */
export const useHaltEnvironment = (
  options?: UseMutationOptions<void, Error, void>
): UseMutationResult<void, Error, void> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env);

  return useMutation({
    mutationFn: () => post("/api/v2/actions/environment/halt", null),
    mutationKey: ["halt_environment", env],
    ...options,
  });
};
