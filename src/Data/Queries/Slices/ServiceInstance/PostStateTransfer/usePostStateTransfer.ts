import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { usePost } from "@/Data/Queries/Helpers";
import { DependencyContext } from "@/UI/Dependency";
import { getInstanceKey } from "../GetInstance";

interface PostStateTransfer {
  message: string;
  current_version: ParsedNumber;
  target_state: string;
}

/**
 * React Query to update the state of an instance.
 *
 * @param {string} instance_id - the UUID of the instance
 * @param {string } service_entity - The service entity type of the instance
 * @returns {UseMutationResult<void, Error, PostStateTransfer, unknown>} The useMutation ReactQuery Hook
 */
export const usePostStateTransfer = (
  instance_id: string,
  service_entity: string,
  options?: UseMutationOptions<void, Error, PostStateTransfer>
): UseMutationResult<void, Error, PostStateTransfer> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<PostStateTransfer>;

  return useMutation({
    mutationFn: (body) =>
      post(`/lsm/v1/service_inventory/${service_entity}/${instance_id}/state`, body),
    mutationKey: ["post_state_transfer", env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: getInstanceKey.single(instance_id) });
      client.invalidateQueries({ queryKey: getInstanceKey.root() });
    },
    ...options,
  });
};
