import { useContext } from "react";
import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";

/**
 * React Query hook for updating environment catalog.
 *
 * @returns {UseMutationResult<void, Error, void, unknown>}- The mutation object from `useMutation` hook.
 */
export const useExportCatalog = (): UseMutationResult<void, Error, void, unknown> => {
  const client = useQueryClient();
  const keyFactory = new KeyFactory(keySlices.service, "get_service_model");
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<void>;

  return useMutation({
    mutationFn: () => post("/lsm/v1/exporter/export_service_definition"),
    mutationKey: ["update_catalog", env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: keyFactory.root() });
    },
  });
};
