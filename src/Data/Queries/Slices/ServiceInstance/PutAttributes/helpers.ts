import { v4 as uuidv4 } from "uuid";
import { Field, InstanceAttributeModel } from "@/Core";
import { sanitizeAttributes } from "@/Data/Common";

export interface BodyPut {
  put_id: string;
  attributes: InstanceAttributeModel;
  comment?: string;
}

/**
 * Generates the request body for the PUT service instance endpoint.
 *
 * Sanitizes the updated attributes to ensure correct types and wraps them with a
 * unique `put_id` for idempotency. All attributes are sent (no diff), because the
 * server-side `ignore_read_only_attributes` flag safely discards read-only fields.
 *
 * @param {Field[]} fields - The list of fields that define the attribute structure.
 * @param {InstanceAttributeModel} updatedAttributes - The updated attributes of the instance.
 * @returns {BodyPut} The request body containing `put_id` and sanitized `attributes`.
 */
export const getBodyPut = (fields: Field[], updatedAttributes: InstanceAttributeModel): BodyPut => {
  const parsedAttributes = sanitizeAttributes(fields, updatedAttributes);

  return { put_id: uuidv4(), attributes: parsedAttributes };
};
