import { Field, InstanceAttributeModel } from "@/Core";
import { AttributeResultConverterImpl } from "./AttributeConverterImpl";

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
      case "Enum": {
        const key = formState[field.name];
        const value =
          typeof key === "string" && key.length > 0 ? field.options[key] : "";
        sanitized[field.name] = converter.ensureAttributeType(
          value,
          field.type
        );
        return;
      }
      case "Boolean":
      case "Text": {
        sanitized[field.name] = converter.ensureAttributeType(
          formState[field.name],
          field.type
        );
        return;
      }

      case "Nested": {
        if (formState[field.name] == null) {
          return;
        }
        sanitized[field.name] = sanitizeAttributes(
          field.fields,
          formState[field.name] as InstanceAttributeModel
        );
        return;
      }
      case "RelationList": {
        sanitized[field.name] = formState[field.name];
        return;
      }

      case "DictList": {
        const list = formState[field.name];
        if (!Array.isArray(list)) return;
        if (field.max && list.length > field.max) {
          sanitized[field.name] = list
            .slice(0, Number(field.max) + 1)
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
