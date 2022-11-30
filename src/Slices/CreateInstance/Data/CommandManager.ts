import { InstanceAttributeModel, Field, ApiHelper } from "@/Core";
import { CommandManagerWithEnv, sanitizeAttributes } from "@/Data/Common";

export function CreateInstanceCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"CreateInstance">(
    "CreateInstance",
    ({ service_entity }, environment) => {
      return async (fields, attributes) => {
        return await apiHelper.post(
          `/lsm/v1/service_inventory/${service_entity}`,
          environment,
          prepBody(fields, attributes)
        );
      };
    }
  );
}

export function prepBody(
  fields: Field[],
  attributes: InstanceAttributeModel
): { attributes: InstanceAttributeModel } {
  const parsedAttributes = sanitizeAttributes(fields, attributes);
  // Don't set optional attributes explicitly to null on creation
  const attributesWithoutNulls = Object.entries(parsedAttributes).reduce(
    (obj, [k, v]) => (v === null ? obj : ((obj[k] = v), obj)),
    {}
  );
  return { attributes: attributesWithoutNulls };
}
