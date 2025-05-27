import { useContext } from "react";
import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { Config } from "@/Core";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { DependencyContext } from "@/UI";
import { usePost } from "../../helpers";

interface Body {
  current_version: number;
  values: Config;
}

interface Response {
  data: Config;
}

/**
 * React Query hook for posting service instance config.
 *
 * @returns {UseMutationResult<Response, Error, Body, unknown>}- The mutation object from `useMutation` hook.
 */
export const usePostInstanceConfig = (
  service_entity: string,
  id: string
): UseMutationResult<Response, Error, Body, unknown> => {
  const client = useQueryClient();
  const keyFactory = new KeyFactory(keySlices.serviceInstance);
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<Body>;

  return useMutation({
    mutationFn: (body) => post(`/lsm/v1/service_inventory/${service_entity}/${id}/config`, body),
    mutationKey: ["post_instance_config", env],
    onSuccess: () => {
      client.refetchQueries({
        queryKey: keyFactory.single(id),
      });
    },
  });
};
