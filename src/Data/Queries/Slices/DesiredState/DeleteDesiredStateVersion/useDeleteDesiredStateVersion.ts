import { useContext } from "react";
import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { useDelete } from "@/Data/Queries";
import { DependencyContext } from "@/UI";

/**
 * React Query hook for deleting version of Desired State
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDeleteDesiredStateVersion = (): UseMutationResult<void, Error, string, unknown> => {
  const client = useQueryClient();
  const keyFactory = new KeyFactory(keySlices.desiredState, "get_desired_state");
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const deleteFn = useDelete(env);

  return useMutation({
    mutationFn: (version) => deleteFn(`/api/v1/version/${version}`),
    mutationKey: ["delete_desired_state_version", env],
    onSuccess: () => {
      //invalidate the desired state queries to update the list
      client.refetchQueries({
        queryKey: keyFactory.root(),
      });
    },
  });
};
