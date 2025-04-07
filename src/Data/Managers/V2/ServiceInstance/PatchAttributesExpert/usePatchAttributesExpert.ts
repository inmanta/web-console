import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from '@tanstack/react-query';
import { ParsedNumber } from '@/Core';
import { usePatch } from '../../helpers';

/**
 * Required attributes to construct the patch request to edit an instance attribute set in Expert mode
 */
export interface ExpertPatchAttributes {
  comment: string;
  attribute_set_name: string;
  current_version: ParsedNumber;
  edit: PatchEdit[];
  patch_id: string;
}

/**
 * Edit content for a patch request
 */
interface PatchEdit {
  edit_id: string;
  operation: string;
  target: string;
  value: unknown;
}

/**
 * React Query to Patch the attributes of a certain set, for an instance, in expert mode.
 *
 * @param {string} instance_id - the UUID of the instance
 * @param {string } service_entity - The service entity type of the instance
 * @returns {UseMutationResult<void, Error, ExpertPatchAttributes, unknown>} The useMutation ReactQuery Hook
 */
export const usePatchAttributesExpert = (
  instance_id: string,
  service_entity: string,
  options?: UseMutationOptions<void, Error, ExpertPatchAttributes>,
): UseMutationResult<void, Error, ExpertPatchAttributes, unknown> => {
  const patch = usePatch()<ExpertPatchAttributes>;

  return useMutation({
    mutationFn: (data) =>
      patch(
        `/lsm/v2/service_inventory/${service_entity}/${instance_id}/expert`,
        data,
      ),
    mutationKey: ['patch_expert_edit'],
    ...options,
  });
};
