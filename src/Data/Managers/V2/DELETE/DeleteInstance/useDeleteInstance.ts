import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { useDelete } from "../../helpers/useQueries";

/**
 * React Query hook for Deleting an instance.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDeleteInstance = (
  instance_id: string,
  service_entity: string,
  version: ParsedNumber,
): UseMutationResult<void, Error, void, unknown> => {
  const deleteFn = useDelete()<void>;

  return useMutation({
    mutationFn: () =>
      deleteFn(
        `/lsm/v1/service_inventory/${service_entity}/${instance_id}?current_version=${version}`,
      ),
    mutationKey: ["delete_instance"],
  });
};
