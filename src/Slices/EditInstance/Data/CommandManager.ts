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
    return `/lsm/v2/service_inventory/${service_entity}/${id}?current_version=${version}`;
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

const create_UUID = () => {
  let dt = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
};

export const getBody = (
  fields: Field[],
  currentAttributes: InstanceAttributeModel | null,
  updatedAttributes: InstanceAttributeModel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): { edit: any; patch_id: string } => {
  // Make sure correct types are used
  const parsedAttributes = sanitizeAttributes(fields, updatedAttributes);

  // Only the difference should be sent
  const attributeDiff = new AttributeResultConverterImpl().calculateDiff(
    parsedAttributes,
    currentAttributes
  );

  console.log("diff: ", attributeDiff);

  return { edit: attributeDiff.edit, patch_id: create_UUID() };
};
