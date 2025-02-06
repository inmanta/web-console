import { v4 as uuidv4 } from "uuid";
import {
  Field,
  InstanceAttributeModel,
  ParsedNumber,
  PatchField,
} from "@/Core";
import {
  AttributeResultConverterImpl,
  sanitizeAttributes,
} from "@/Data/Common";

export interface BodyV1 {
  attributes: InstanceAttributeModel;
}

export interface BodyV2 {
  edit: Array<PatchField>;
  patch_id: string;
}

export const getBodyV1 = (
  fields: Field[],
  currentAttributes: InstanceAttributeModel | null,
  updatedAttributes: InstanceAttributeModel,
): BodyV1 => {
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
): BodyV2 => {
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
