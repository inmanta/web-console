import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useDelete } from "@inmanta/web-console-core/Queries/Helpers";

/**
 * React Query hook for Deleting an instance.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDeleteInstance = (
  instance_id: string,
  service_entity: string,
  version: ParsedNumber,
  options?: UseMutationOptions<void, Error, void, unknown>
): UseMutationResult<void, Error, void, unknown> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const deleteFn = useDelete(env);

  return useMutation({
    mutationFn: () =>
      deleteFn(
        `/lsm/v1/service_inventory/${service_entity}/${instance_id}?current_version=${version}`
      ),
    mutationKey: ["delete_instance", env],
    ...options,
  });
};
