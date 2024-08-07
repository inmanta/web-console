import { v4 as uuidv4 } from "uuid";
import {
  Command,
  Field,
  ApiHelper,
  InstanceAttributeModel,
  PatchField,
  ParsedNumber,
} from "@/Core";
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

    apiVersion = "v1",
  }: Command.SubCommand<"TriggerInstanceUpdate">): string {
    return `/lsm/${apiVersion}/service_inventory/${service_entity}/${id}?current_version=${version}`;
  }

  return CommandManagerWithEnv<"TriggerInstanceUpdate">(
    "TriggerInstanceUpdate",
    (command, environment) =>
      async (fields: Field[], currentAttributes, updatedAttributes) => {
        if (command.apiVersion === "v2") {
          return await apiHelper.patch(
            getUrl(command),
            environment,
            getBodyV2(
              fields,
              updatedAttributes,
              command.service_entity,
              command.version,
            ),
          );
        } else {
          return await apiHelper.patch(
            getUrl(command),
            environment,
            getBodyV1(fields, currentAttributes, updatedAttributes),
          );
        }
      },
  );
}

export const getBodyV1 = (
  fields: Field[],
  currentAttributes: InstanceAttributeModel | null,
  updatedAttributes: InstanceAttributeModel,
): { attributes: InstanceAttributeModel } => {
  // Make sure correct types are used
  const parsedAttributes = sanitizeAttributes(fields, updatedAttributes);
  // Only the difference should be sent
  const attributeDiff = new AttributeResultConverterImpl().calculateDiff(
    parsedAttributes,
    currentAttributes,
  );

  return { attributes: attributeDiff };
};

export const getBodyV2 = (
  fields: Field[],
  updatedAttributes: InstanceAttributeModel,
  service_id: string,
  version: ParsedNumber,
): { edit: Array<PatchField>; patch_id: string } => {
  // Make sure correct types are used
  const parsedAttributes = sanitizeAttributes(fields, updatedAttributes);

  const patchData = [
    {
      edit_id: `${service_id}_version=${version}`,
      operation: "replace",
      target: ".",
      value: parsedAttributes,
    },
  ];

  return { edit: patchData, patch_id: uuidv4() };
};
