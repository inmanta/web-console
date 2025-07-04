import { useContext } from "react";
import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { Config } from "@/Core";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getServiceConfigKey } from "../GetServiceConfig";
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
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<Params>;

  return useMutation({
    mutationFn: (body) => post(`/lsm/v1/service_catalog/${service_entity}/config`, body),
    mutationKey: ["post_config", env],
    onSuccess: () => {
      client.refetchQueries({ queryKey: getServiceConfigKey.single(service_entity) });
    },
  });
};
