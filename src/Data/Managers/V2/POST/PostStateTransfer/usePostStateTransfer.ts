import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { usePost } from "../../helpers/useQueries";

export interface PostStateTransfer {
  message: string;
  current_version: ParsedNumber;
  target_state: string;
}
export interface StateTransferResponse {
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
  options?: UseMutationOptions<StateTransferResponse, Error, PostStateTransfer>,
): UseMutationResult<StateTransferResponse, Error, PostStateTransfer> => {
  const post = usePost()<StateTransferResponse, PostStateTransfer>;

  return useMutation({
    mutationFn: (body) =>
      post(
        `/lsm/v1/service_inventory/${service_entity}/${instance_id}/state`,
        body,
      ),
    mutationKey: ["post_state_transfer"],
    ...options,
  });
};
