import { v4 as uuidv4 } from "uuid";
import { Field, InstanceAttributeModel } from "@/Core";
import { sanitizeAttributes } from "@/Data/Common";

export interface BodyPut {
  put_id: string;
  current_version: number;
  attributes: InstanceAttributeModel;
  ignore_read_only_attributes: boolean;
  comment?: string;
}

/**
 * Generates the request body for the PUT service instance endpoint.
 *
 * Sanitizes the updated attributes to ensure correct types and wraps them with a
 * unique `put_id` for idempotency. All attributes are sent (no diff), because
 * `ignore_read_only_attributes: true` instructs the server to safely discard read-only fields.
 *
 * @param {Field[]} fields - The list of fields that define the attribute structure.
 * @param {InstanceAttributeModel} updatedAttributes - The updated attributes of the instance.
 * @param {number} version - The current version of the instance (for optimistic concurrency).
 * @returns {BodyPut} The request body.
 */
export const getBodyPut = (
  fields: Field[],
  updatedAttributes: InstanceAttributeModel,
  version: number
): BodyPut => {
  const parsedAttributes = sanitizeAttributes(fields, updatedAttributes);

  return {
    put_id: uuidv4(),
    current_version: version,
    attributes: parsedAttributes,
    ignore_read_only_attributes: true,
  };
};
