import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDelete } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getServiceModelKey } from "../GetServiceModel";

/**
 * React Query hook for Deleting an Service.
 *
 * @returns {Mutation} - The mutation object provided by `useMutation` hook.
 */
export const useDeleteService = (
  service_entity: string,
  options?: UseMutationOptions<void, Error, void>
): UseMutationResult<void, Error, void> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const deleteFn = useDelete(env);

  return useMutation({
    mutationFn: () => deleteFn(`/lsm/v1/service_catalog/${service_entity}`),
    mutationKey: ["delete_service", env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: getServiceModelKey.root() });
    },
    ...options,
  });
};
