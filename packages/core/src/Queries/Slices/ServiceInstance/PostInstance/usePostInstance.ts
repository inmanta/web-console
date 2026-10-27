import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { Field, InstanceAttributeModel, ServiceInstanceModel } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { CustomError, usePost } from "@inmanta/web-console-core/Queries/Helpers";
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
 * @returns {UseMutationResult<Response, CustomError, Params, unknown>}- The mutation object from `useMutation` hook.
 */
export const usePostInstance = (
  service_entity: string,
  options?: UseMutationOptions<Response, CustomError, Params>
): UseMutationResult<Response, CustomError, Params, unknown> => {
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
