import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { Config } from "@/Core";
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
  const post = usePost()<Params>;

  return useMutation({
    mutationFn: (body) => post(`/lsm/v1/service_catalog/${service_entity}/config`, body),
    mutationKey: ["post_config"],
    onSuccess: () => {
      client.resetQueries({
        queryKey: ["get_service_config-one_time", service_entity],
      });
    },
  });
};
