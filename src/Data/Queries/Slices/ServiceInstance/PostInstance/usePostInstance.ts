import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { Field, InstanceAttributeModel, ServiceInstanceModel } from "@/Core";
import { usePost } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { prepBody } from "./helper";

interface Params {
  fields: Field[];
  attributes: InstanceAttributeModel;
  initial_state?: string;
}

interface Body {
  attributes: InstanceAttributeModel;
  initial_state?: string;
}

interface Response {
  data: ServiceInstanceModel;
}

/**
 * React Query hook for posting instance.
 *
 * @returns {UseMutationResult<Response, Error, Params, unknown>}- The mutation object from `useMutation` hook.
 */
export const usePostInstance = (
  service_entity: string,
  options?: UseMutationOptions<Response, Error, Params>
): UseMutationResult<Response, Error, Params, unknown> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<Body>;

  return useMutation({
    mutationFn: ({ fields, attributes, initial_state }) => {
      const body: Body = prepBody(fields, attributes, initial_state);
      return post(`/lsm/v1/service_inventory/${service_entity}`, body);
    },
    mutationKey: ["post_instance", env],
    ...options,
  });
};
