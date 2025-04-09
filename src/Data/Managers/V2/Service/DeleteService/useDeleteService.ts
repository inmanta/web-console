import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDelete } from "../../helpers";

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
  const deleteFn = useDelete();

  return useMutation({
    mutationFn: () => deleteFn(`/lsm/v1/service_catalog/${service_entity}`),
    mutationKey: ["delete_service"],
    onSuccess: () => {
      client.refetchQueries({ queryKey: ["get_service_models-continuous"] });
      client.refetchQueries({ queryKey: ["get_service_models-one_time"] });
      client.refetchQueries({ queryKey: ["get_service_model-one_time"] });
      client.refetchQueries({ queryKey: ["get_service_model-continuous"] });
    },
    ...options,
  });
};
