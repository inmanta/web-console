import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePost } from "../../helpers/useQueries";

/**
 * React Query hook for updating environment catalog.
 *
 * @returns {UseMutationResult<void, Error, void, unknown>}- The mutation object from `useMutation` hook.
 */
export const useExportCatalog = (): UseMutationResult<
  void,
  Error,
  void,
  unknown
> => {
  const client = useQueryClient();
  const post = usePost()<void, void>;

  return useMutation({
    mutationFn: () => post(`/lsm/v1/exporter/export_service_definition`),
    mutationKey: ["update_catalog"],
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["get_service_models-one_time"] });
      client.invalidateQueries({ queryKey: ["get_service_models-continuous"] });
    },
  });
};
