import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { CreateCallbackBody } from "@/Slices/ServiceDetails/Core/Callback";
import { usePost } from "../../helpers";

/**
 * React Query hook for creating callback
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useCreateCallback = (
  options?: UseMutationOptions<void, Error, CreateCallbackBody, unknown>
): UseMutationResult<void, Error, CreateCallbackBody, unknown> => {
  const postFn = usePost();

  return useMutation({
    mutationFn: (body) => postFn("/lsm/v1/callbacks", body),
    mutationKey: ["post_callback"],
    ...options,
  });
};
