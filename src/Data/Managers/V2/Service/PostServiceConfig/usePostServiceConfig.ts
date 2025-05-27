import { useContext } from "react";
import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { Config } from "@/Core";
import { KeyFactory, keySlices } from "@/Data/Managers/KeyFactory";
import { DependencyContext } from "@/UI";
import { usePost } from "../../helpers";

export interface Params {
  values: Config;
}

interface Response {
  data: Config;
}

/**
 * React Query hook for posting service config.
 *
 * @returns {UseMutationResult<Response, Error, Params, unknown>}- The mutation object from `useMutation` hook.
 */
export const usePostServiceConfig = (
  service_entity: string
): UseMutationResult<Response, Error, Params, unknown> => {
  const client = useQueryClient();
  const keyFactory = new KeyFactory(keySlices.service, "get_service_config");
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<Params>;

  return useMutation({
    mutationFn: (body) => post(`/lsm/v1/service_catalog/${service_entity}/config`, body),
    mutationKey: ["post_config", env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: keyFactory.single(service_entity) });
    },
  });
};
