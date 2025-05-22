import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { Config, Field, InstanceAttributeModel } from "@/Core";
import { DependencyContext } from "@/UI";
import { usePatch } from "@/Data/Queries/Helpers";
import { BodyV1, BodyV2, getBodyV1, getBodyV2 } from "./helpers";

interface MutationBody {
  fields: Field[];
  currentAttributes: InstanceAttributeModel | null;
  updatedAttributes: InstanceAttributeModel;
}

interface Response {
  data: Config;
}

/**
 * React Query hook for patching instance attributes.
 *
 * @returns {UseMutationResult<Response, Error, MutationBody, unknown>}- The mutation object from `useMutation` hook.
 */
export const usePatchAttributes = (
  apiVersion: string,
  service_entity: string,
  id: string,
  version: number,
  options: UseMutationOptions<Response, Error, MutationBody>
): UseMutationResult<Response, Error, MutationBody, unknown> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const url = `/lsm/${apiVersion}/service_inventory/${service_entity}/${id}?current_version=${version}`;
  const patch = usePatch(env)<BodyV1 | BodyV2>;

  return useMutation({
    mutationFn: (body) => {
      const { fields, currentAttributes, updatedAttributes } = body;
      const convertedBody =
        apiVersion === "v2"
          ? getBodyV2(fields, updatedAttributes, id, version)
          : getBodyV1(fields, currentAttributes, updatedAttributes);

      return patch(url, convertedBody);
    },
    mutationKey: ["post_instance_config", service_entity, id, version, apiVersion, env],
    ...options,
  });
};
