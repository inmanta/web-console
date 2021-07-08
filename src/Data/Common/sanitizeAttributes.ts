import { Field, InstanceAttributeModel } from "@/Core";
import { AttributeResultConverterImpl } from "@/Data";

/**
 * Creates a type-correct object based on the fields and form values.
 *
 * @param fields Rules for each attribute
 * @param formState values of each form field
 * @returns the sanitized attribute values
 */
export function sanitizeAttributes(
  fields: Field[],
  formState: InstanceAttributeModel
): InstanceAttributeModel {
  const converter = new AttributeResultConverterImpl();
  const sanitized = { ...formState };

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

      case "DictList": {
        const list = formState[field.name];
        if (!Array.isArray(list)) return;
        if (list.length > field.max) {
          sanitized[field.name] = list
            .slice(0, field.max + 1)
            .map((item) => sanitizeAttributes(field.fields, item));
        } else {
          sanitized[field.name] = list.map((item) =>
            sanitizeAttributes(field.fields, item)
          );
        }
        return;
      }
    }
  });

  return sanitized;
}
