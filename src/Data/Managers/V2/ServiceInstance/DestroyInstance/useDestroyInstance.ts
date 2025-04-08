import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { useDelete } from "../../helpers";

/**
 * React Query hook for destroying an instance.
 * This is an expert action, and dangerous to perform.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDestroyInstance = (
  instance_id: string,
  service_entity: string,
  version: ParsedNumber,
  message: string,
  options?: UseMutationOptions<void, Error, void, unknown>
): UseMutationResult<void, Error, void, unknown> => {
  const deleteFn = useDelete({ message });

  return useMutation({
    mutationFn: () =>
      deleteFn(
        `/lsm/v2/service_inventory/${service_entity}/${instance_id}/expert?current_version=${version}`
      ),
    mutationKey: ["destroy_instance"],
    ...options,
  });
};
