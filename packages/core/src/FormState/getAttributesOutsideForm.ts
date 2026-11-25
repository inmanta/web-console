import { Field, InstanceAttributeModel } from "@inmanta/web-console-core";

/**
 * Returns the top-level attributes that have no field in the form. The edit form only holds the
 * attributes it can change, so this gives the stored values of the others (e.g. `rw` and `r`
 * attributes), which `${form.*}` references in suggestions can still read.
 */
export const getAttributesOutsideForm = (
  fields: Field[],
  attributes: InstanceAttributeModel
): InstanceAttributeModel => {
  const fieldNames = fields.map((field) => field.name);

  return Object.fromEntries(
    Object.entries(attributes).filter(([name]) => !fieldNames.includes(name))
  );
};
