import { cloneDeep, merge } from "lodash";
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
    // eslint-disable-next-line
    apiVersion = "v1",
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
          getBodyV1(fields, currentAttributes, updatedAttributes)
        );

        // TODO make PATCH V2 ready, refactoring should allow the form to keep the original data aswell, instead of discarding it.
        // if (command.apiVersion === "v2") {
        //   return await apiHelper.patch(
        //     getUrl(command),
        //     environment,
        //     getBodyV2(
        //       fields,
        //       currentAttributes,
        //       updatedAttributes,
        //       command.service_entity,
        //       command.version
        //     )
        //   );
        // } else {
        //   return await apiHelper.patch(
        //     getUrl(command),
        //     environment,
        //     getBodyV1(fields, currentAttributes, updatedAttributes)
        //   );
        // }
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

export const getBodyV1 = (
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

export const getBodyV2 = (
  fields: Field[],
  currentAttributes: InstanceAttributeModel | null,
  updatedAttributes: InstanceAttributeModel,
  service_id: string,
  version: ParsedNumber
): { edit: Array<PatchField>; patch_id: string } => {
  // Make sure correct types are used
  const parsedAttributes = sanitizeAttributes(fields, updatedAttributes);

  const richDiff = cloneDeep(parsedAttributes);
  merge(richDiff, currentAttributes);

  const patchData = [
    {
      edit_id: `${service_id}_version=${version}`,
      operation: "replace",
      target: ".",
      value: richDiff,
    },
  ];

  return { edit: patchData, patch_id: create_UUID() };
};
