import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Config } from "@/Core";
import { usePost } from "../../helpers/useQueries";

interface Body {
  current_version: number;
  values: Config;
}

interface Response {
  data: Config;
}

/**
 * React Query hook for posting service instance .
 *
 * @returns {UseMutationResult<Response, Error, Body, unknown>}- The mutation object from `useMutation` hook.
 */
export const usePostInstanceConfig = (
  service_entity: string,
  id: string,
): UseMutationResult<Response, Error, Body, unknown> => {
  const client = useQueryClient();
  const post = usePost()<Body>;

  return useMutation({
    mutationFn: (body) =>
      post(`/lsm/v1/service_inventory/${service_entity}/${id}/config`, body),
    mutationKey: ["post_instance_config"],
    onSuccess: () => {
      client.refetchQueries({
        queryKey: ["get_instance_config-one_time", service_entity, id],
      });
      client.refetchQueries({
        queryKey: ["get_instance-continuous", service_entity, id],
      });
    },
  });
};
