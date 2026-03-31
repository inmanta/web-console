import { useContext } from "react";
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getServiceModelKey } from "../GetServiceModel";

/**
 * React Query hook for exporting the environment catalog.
 *
 * @param options - Optional React Query mutation options.
 * @returns {UseMutationResult<void, Error, void, unknown>} The mutation object from `useMutation`.
 */
export const useExportCatalog = (
  options?: UseMutationOptions<void, Error, void, unknown>
): UseMutationResult<void, Error, void, unknown> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<void>;
  const { onSuccess, ...rest } = options ?? {};

  return useMutation({
    mutationFn: () => post("/lsm/v1/exporter/export_service_definition"),
    mutationKey: ["update_catalog", env],
    onSuccess: (data, ...restArgs) => {
      client.refetchQueries({ queryKey: getServiceModelKey.root() });
      onSuccess?.(data, ...restArgs);
    },
    ...rest,
  });
};
