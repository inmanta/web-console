import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useDelete } from "@inmanta/web-console-core/Queries/Helpers";
import { getCallbackKey } from "../GetCallbacks/useGetCallbacks";

/**
 * React Query hook for deleting callback of given id
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDeleteCallback = (
  options?: UseMutationOptions<void, Error, string, unknown>
): UseMutationResult<void, Error, string, unknown> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const deleteFn = useDelete(env);

  return useMutation({
    mutationFn: (id) => deleteFn(`/lsm/v1/callbacks/${encodeURIComponent(id)}`),
    mutationKey: ["delete_callback", env],
    onSuccess: () => {
      //invalidate the get_callbacks query to update the list
      client.invalidateQueries({
        queryKey: getCallbackKey.root(),
      });
    },
    ...options,
  });
};
