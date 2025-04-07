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

/**
 * Generates the request body for version 1 of the API.
 *
 * This function takes the fields, current attributes, and updated attributes,
 * sanitizes the updated attributes, and calculates the difference between the
 * current and updated attributes. The resulting difference is returned as the
 * request body.
 *
 * @param {Field[]} fields - The list of fields that define the structure of the attributes.
 * @param {InstanceAttributeModel | null} currentAttributes - The current attributes of the instance, or null if there are none.
 * @param {InstanceAttributeModel} updatedAttributes - The updated attributes of the instance.
 * @returns The request body containing the attribute differences.
 */
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

/**
 * Generates the request body for version 2 of the API.
 *
 * This function takes the fields, updated attributes, service ID, and version,
 * sanitizes the updated attributes, and constructs the patch data. The resulting
 * patch data and a unique patch ID are returned as the request body.
 *
 * @param {Field[]}  fields - The list of fields that define the structure of the attributes.
 * @param {InstanceAttributeModel} updatedAttributes - The updated attributes of the instance.
 * @param {string} service_id - The ID of the service instance.
 * @param {string} version - The version number of the service instance.
 * @returns The request body containing the patch data and a unique patch ID.
 */
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
