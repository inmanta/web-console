import { Field, InstanceAttributeModel } from '@/Core';
import { sanitizeAttributes } from '@/Data/Common';

export function prepBody (
  fields: Field[],
  attributes: InstanceAttributeModel,
): { attributes: InstanceAttributeModel } {
  const parsedAttributes = sanitizeAttributes(fields, attributes);
  // Don't set optional attributes explicitly to null on creation
  const attributesWithoutNulls = Object.entries(parsedAttributes).reduce(
    (obj, [k, v]) => (v === null ? obj : ((obj[k] = v), obj)),
    {},
  );

  return { attributes: attributesWithoutNulls };
}
