import { useContext } from "react";
import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getServiceModelFactory } from "../GetServiceModel";

/**
 * React Query hook for updating environment catalog.
 *
 * @returns {UseMutationResult<void, Error, void, unknown>}- The mutation object from `useMutation` hook.
 */
export const useExportCatalog = (): UseMutationResult<void, Error, void, unknown> => {
  const client = useQueryClient();
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<void>;

  return useMutation({
    mutationFn: () => post("/lsm/v1/exporter/export_service_definition"),
    mutationKey: ["update_catalog", env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: getServiceModelFactory.root() });
    },
  });
};
