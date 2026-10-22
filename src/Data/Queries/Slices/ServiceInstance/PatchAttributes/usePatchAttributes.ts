import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { Config, Field, InstanceAttributeModel } from "@/Core";
import { CustomError, usePatch } from "@/Data/Queries/Helpers";
import { DependencyContext } from "@/UI/Dependency";
import { BodyV1, getBodyV1 } from "./helpers";

interface MutationBody {
  fields: Field[];
  currentAttributes: InstanceAttributeModel | null;
  updatedAttributes: InstanceAttributeModel;
}

interface Response {
  data: Config;
}

/**
 * React Query hook for patching instance attributes via PATCH v1.
 *
 * Sends only the changed attributes (diff against current state) to
 * PATCH /lsm/v1/service_inventory/{service_entity}/{id}.
 *
 * @returns {UseMutationResult<Response, CustomError, MutationBody, unknown>} The mutation object.
 */
export const usePatchAttributes = (
  service_entity: string,
  id: string,
  version: number,
  options: UseMutationOptions<Response, CustomError, MutationBody>
): UseMutationResult<Response, CustomError, MutationBody, unknown> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const url = `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`;
  const patch = usePatch(env)<BodyV1>;

  return useMutation({
    mutationFn: ({ fields, currentAttributes, updatedAttributes }) =>
      patch(url, getBodyV1(fields, currentAttributes, updatedAttributes)),
    mutationKey: ["post_instance_config", service_entity, id, version, env],
    ...options,
  });
};
