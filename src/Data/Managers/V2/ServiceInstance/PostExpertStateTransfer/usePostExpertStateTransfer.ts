import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { ParsedNumber } from '@/Core';
import { usePost } from '../../helpers';

/**
 * Required attributes to construct the post request to force update the state of an instance in Expert mode
 */
interface PostExpertStateTransfer {
  message: string;
  current_version: ParsedNumber;
  target_state: string;
  operation?: string;
}

/**
 * React Query to Force update the state of an instance in expert mode.
 *
 * @param {string} instance_id - the UUID of the instance
 * @param {string } service_entity - The service entity type of the instance
 * @returns {UseMutationResult<void, Error, PostExpertStateTransfer, unknown>} The useMutation ReactQuery Hook
 */
export const usePostExpertStateTransfer = (
  instance_id: string,
  service_entity: string,
  options?: UseMutationOptions<void, Error, PostExpertStateTransfer>,
): UseMutationResult<void, Error, PostExpertStateTransfer, unknown> => {
  const client = useQueryClient();
  const post = usePost()<PostExpertStateTransfer>;

  return useMutation({
    mutationFn: (data) =>
      post(
        `/lsm/v1/service_inventory/${service_entity}/${instance_id}/expert/state`,
        data,
      ),
    mutationKey: ['post_state_transfer_expert'],
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: [service_entity, instance_id],
      });
      client.invalidateQueries({
        queryKey: ['get_service_instances-one_time'],
      });
      client.invalidateQueries({
        queryKey: ['get_service_instances-continuous'],
      });
    },
    ...options,
  });
};
