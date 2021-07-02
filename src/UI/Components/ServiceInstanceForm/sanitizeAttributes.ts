import { Field, InstanceAttributeModel } from "@/Core";
import { AttributeResultConverterImpl } from "@/Data";

/**
 * Creates a type-correct object based on the fields and form values.
 * This object can be send to the backend.
 *
 * @note Optional attributes with a value of null should be removed
 * @todo Implement function
 * @param fields Rules for each attribute
 * @param attributes form values
 * @returns the sanitized attribute values
 */
export function sanitizeAttributes(
  fields: Field[],
  formState: InstanceAttributeModel
): InstanceAttributeModel {
  const converter = new AttributeResultConverterImpl();
  const sanitized = { ...formState };

  console.log(JSON.stringify({ fields, sanitized }, null, 4));

  fields.forEach((field) => {
    switch (field.kind) {
      case "Flat": {
        sanitized[field.name] = converter.ensureAttributeType(
          formState[field.name],
          field.type
        );
        return;
      }

      case "Nested": {
        sanitized[field.name] = sanitizeAttributes(
          field.fields,
          formState[field.name] as InstanceAttributeModel
        );
        return;
      }

      /**
       * @todo sanitize properties in list
       */
      case "DictList": {
        const list = formState[field.name];
        if (!Array.isArray(list)) return;
        if (list.length > field.max) {
          sanitized[field.name] = list.slice(0, field.max + 1);
        } else {
          sanitized[field.name] = list;
        }
        return;
      }
    }
  });

  return sanitized;
}
