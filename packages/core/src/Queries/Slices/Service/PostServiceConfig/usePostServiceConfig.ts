import { useContext } from "react";
import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { Config } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { usePost } from "@inmanta/web-console-core/Queries/Helpers";
import { getServiceConfigKey } from "../GetServiceConfig";
export interface Params {
  values: Config;
}

/**
 * React Query hook for posting service config.
 *
 * @returns {UseMutationResult<void, Error, Params, unknown>}- The mutation object from `useMutation` hook.
 */
export const usePostServiceConfig = (
  service_entity: string
): UseMutationResult<void, Error, Params, unknown> => {
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
