import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { Config, Field, InstanceAttributeModel } from "@/Core";
import { usePut } from "@/Data/Queries";
import { DependencyContext } from "@/UI";
import { BodyPut, getBodyPut } from "./helpers";

interface MutationBody {
  fields: Field[];
  updatedAttributes: InstanceAttributeModel;
}

interface Response {
  data: Config;
}

/**
 * React Query hook for updating instance attributes via PUT.
 *
 * Uses PUT /api/v1/service_inventory/{service_entity}/{id} with
 * `ignore_read_only_attributes=true` so the server safely ignores any read-only
 * fields present in the payload.
 *
 * @returns {UseMutationResult<Response, Error, MutationBody, unknown>} The mutation object.
 */
export const usePutAttributes = (
  service_entity: string,
  id: string,
  version: number,
  options: UseMutationOptions<Response, Error, MutationBody>
): UseMutationResult<Response, Error, MutationBody, unknown> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const url = `/api/v1/service_inventory/${service_entity}/${id}?current_version=${version}&ignore_read_only_attributes=true`;
  const put = usePut(env)<BodyPut>;

  return useMutation({
    mutationFn: ({ fields, updatedAttributes }) => put(url, getBodyPut(fields, updatedAttributes)),
    mutationKey: ["put_instance_attributes", service_entity, id, version, env],
    ...options,
  });
};
