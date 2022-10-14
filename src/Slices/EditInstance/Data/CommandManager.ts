import { Command, Field, ApiHelper, InstanceAttributeModel } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";
import {
  AttributeResultConverterImpl,
  sanitizeAttributes,
} from "@/Data/Common/AttributeConverter";

export function TriggerInstanceUpdateCommandManager(apiHelper: ApiHelper) {
  function getUrl({
    service_entity,
    id,
    version,
  }: Command.SubCommand<"TriggerInstanceUpdate">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`;
  }
  return CommandManagerWithEnv<"TriggerInstanceUpdate">(
    "TriggerInstanceUpdate",
    (command, environment) =>
      async (fields: Field[], currentAttributes, updatedAttributes) => {
        return await apiHelper.patch(
          getUrl(command),
          environment,
          getBody(fields, currentAttributes, updatedAttributes)
        );
      }
  );
}

export const getBody = (
  fields: Field[],
  currentAttributes: InstanceAttributeModel | null,
  updatedAttributes: InstanceAttributeModel
): { attributes: InstanceAttributeModel } => {
  // Make sure correct types are used
  const parsedAttributes = sanitizeAttributes(fields, updatedAttributes);

  // Only the difference should be sent
  const attributeDiff = new AttributeResultConverterImpl().calculateDiff(
    parsedAttributes,
    currentAttributes
  );

  return { attributes: attributeDiff };
};
