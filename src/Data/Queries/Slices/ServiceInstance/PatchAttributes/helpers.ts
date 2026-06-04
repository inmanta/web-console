import { Field, InstanceAttributeModel } from "@/Core";
import { AttributeResultConverterImpl, sanitizeAttributes } from "@/Data/Common";

export interface BodyV1 {
  attributes: InstanceAttributeModel;
}

/**
 * Generates the request body for the PATCH v1 endpoint.
 *
 * Sanitizes the updated attributes and calculates only the diff against the current
 * attributes so that unchanged values are not sent to the server.
 *
 * @param {Field[]} fields - The list of fields that define the structure of the attributes.
 * @param {InstanceAttributeModel | null} currentAttributes - The current attributes of the instance.
 * @param {InstanceAttributeModel} updatedAttributes - The updated attributes of the instance.
 * @returns {BodyV1} The request body containing only the changed attributes.
 */
export const getBodyV1 = (
  fields: Field[],
  currentAttributes: InstanceAttributeModel | null,
  updatedAttributes: InstanceAttributeModel
): BodyV1 => {
  const parsedAttributes = sanitizeAttributes(fields, updatedAttributes);
  const attributeDiff = new AttributeResultConverterImpl().calculateDiff(
    parsedAttributes,
    currentAttributes
  );

  return { attributes: attributeDiff };
};
