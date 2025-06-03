import { useContext } from "react";
import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { Config } from "@/Core";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { getInstanceConfigFactory } from "../GetInstanceConfig";

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
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<Body>;

  return useMutation({
    mutationFn: (body) => post(`/lsm/v1/service_inventory/${service_entity}/${id}/config`, body),
    mutationKey: ["post_instance_config", env],
    onSuccess: () => {
      client.refetchQueries({
        queryKey: getInstanceConfigFactory.single(id),
      });
    },
  });
};
