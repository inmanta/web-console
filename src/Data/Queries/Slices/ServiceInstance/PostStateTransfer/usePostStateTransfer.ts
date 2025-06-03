import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getInstanceFactory } from "../GetInstance";

interface PostStateTransfer {
  message: string;
  current_version: ParsedNumber;
  target_state: string;
}

interface StateTransferResponse {
  current_version: 0;
  target_state: "string";
  message: "string";
}

/**
 * React Query to update the state of an instance.
 *
 * @param {string} instance_id - the UUID of the instance
 * @param {string } service_entity - The service entity type of the instance
 * @returns {UseMutationResult<StateTransferResponse, Error, PostStateTransfer, unknown>} The useMutation ReactQuery Hook
 */
export const usePostStateTransfer = (
  instance_id: string,
  service_entity: string,
  options?: UseMutationOptions<StateTransferResponse, Error, PostStateTransfer>
): UseMutationResult<StateTransferResponse, Error, PostStateTransfer> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<PostStateTransfer>;

  return useMutation({
    mutationFn: (body) =>
      post(`/lsm/v1/service_inventory/${service_entity}/${instance_id}/state`, body),
    mutationKey: ["post_state_transfer", env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: getInstanceFactory.single(instance_id) });
      client.invalidateQueries({ queryKey: getInstanceFactory.root() });
    },
    ...options,
  });
};
