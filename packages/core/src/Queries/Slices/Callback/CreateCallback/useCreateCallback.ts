import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { CreateCallbackBody } from "@inmanta/web-console-core/Domain/Callback";
import { usePost } from "@inmanta/web-console-core/Queries/Helpers";

/**
 * React Query hook for creating callback
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useCreateCallback = (
  options?: UseMutationOptions<void, Error, CreateCallbackBody, unknown>
): UseMutationResult<void, Error, CreateCallbackBody, unknown> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const postFn = usePost(env);

  return useMutation({
    mutationFn: (body) => postFn("/lsm/v1/callbacks", body),
    mutationKey: ["post_callback", env],
    ...options,
  });
};
