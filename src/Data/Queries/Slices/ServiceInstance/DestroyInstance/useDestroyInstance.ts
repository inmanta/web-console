import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { DependencyContext } from "@/UI";
import { useDelete } from "@/Data/Queries";

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
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const deleteFn = useDelete(env, { message });

  return useMutation({
    mutationFn: () =>
      deleteFn(
        `/lsm/v2/service_inventory/${service_entity}/${instance_id}/expert?current_version=${version}`
      ),
    mutationKey: ["destroy_instance", env],
    ...options,
  });
};
