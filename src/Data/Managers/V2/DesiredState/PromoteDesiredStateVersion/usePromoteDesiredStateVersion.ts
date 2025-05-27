import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { DependencyContext } from "@/UI";
import { usePost } from "../../helpers";

/**
 * React Query hook for promoting a version of desired state
 *
 * @returns {Mutation} The mutation object for sending the request.
 */
export const usePromoteDesiredStateVersion = (
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> => {
  const client = useQueryClient();
  const keyFactory = new KeyFactory(keySlices.desiredState, "get_desired_state");
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<void>;

  return useMutation({
    mutationFn: (version) => post(`/api/v2/desiredstate/${version}/promote`),
    mutationKey: ["promote_version", env],
    ...options,
    onSuccess: () => {
      // Refetch the desired state queries to update the list
      client.refetchQueries({
        queryKey: keyFactory.root(),
      });
    },
  });
};
