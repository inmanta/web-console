import { Field, InstanceAttributeModel } from "@/Core";
import { sanitizeAttributes } from "@/Data/Common";

/**
 * Prepares the body for the post instance request.
 *
 * @param {Field[]} fields - The fields of the instance.
 * @param {InstanceAttributeModel} attributes - The attributes of the instance.
 * @param {string} [initial_state] - Optional.The initial state of the instance.
 * @param fields
 * @param attributes
 * @param initial_state
 * @returns {attributes: InstanceAttributeModel; initial_state?: string} The prepared body.
 */
export function prepBody(
  fields: Field[],
  attributes: InstanceAttributeModel,
  initial_state?: string
): { attributes: InstanceAttributeModel; initial_state?: string } {
  const parsedAttributes = sanitizeAttributes(fields, attributes);
  // Don't set optional attributes explicitly to null on creation
  const attributesWithoutNulls = Object.entries(parsedAttributes).reduce(
    (obj, [k, v]) => (v === null ? obj : ((obj[k] = v), obj)),
    {}
  );

  return { attributes: attributesWithoutNulls, ...(initial_state && { initial_state }) };
}
