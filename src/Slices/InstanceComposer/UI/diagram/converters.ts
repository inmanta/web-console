import { AttributeModel } from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import { ModifierHandler } from "@/UI/Components";
interface ComposerFields {
  [key: string]: {
    kind: string | null | undefined;
    name: string | null | undefined;
    defaultValue: string | null | undefined;
    description: string | null | undefined;
    type: string | null | undefined;
    isOptional: boolean | null | undefined;
    inputType: string;
  };
}

export function attributesToComposerFields(
  attributes: AttributeModel[],
  fieldModifierHandler: ModifierHandler,
  embedded?: boolean
): ComposerFields {
  const converter = new AttributeInputConverterImpl();
  const inputsObject = {};
  attributes
    .filter((attribute) =>
      fieldModifierHandler.validateModifier(attribute.modifier, embedded)
    )
    .forEach((attribute) => {
      const type = converter.getInputType(attribute);
      const defaultValue = converter.getFormDefaultValue(
        type,
        attribute.default_value_set,
        attribute.default_value
      );

      if (type === "bool") {
        inputsObject[attribute.name] = {
          kind: "Boolean",
          name: attribute.name,
          defaultValue: defaultValue,
          description: attribute.description,
          type: attribute.type,
          isOptional: attribute.type.includes("?"),
        };
      }

      if (attribute.validation_type === "enum") {
        inputsObject[attribute.name] = {
          kind: "Enum",
          name: attribute.name,
          defaultValue: defaultValue,
          description: attribute.description,
          type: attribute.type,
          isOptional: attribute.type.includes("?"),
          options: attribute.validation_parameters.names,
        };
      }

      inputsObject[attribute.name] = {
        kind: "Text",
        name: attribute.name,
        defaultValue: defaultValue,
        inputType: type,
        description: attribute.description,
        type: attribute.type,
        isOptional: isTextFieldOptional(attribute),
      };
    });
  return inputsObject;
}
export function composerFieldsToInputs(fields: ComposerFields) {
  const keys = Object.keys(fields);
  const obj = {};
  keys.forEach((key, index) => {
    obj[index + "/value"] = {
      label: fields[key].name,
      type: fields[key].inputType === "bool" ? "toggle" : fields[key].inputType,
      value: fields[key].defaultValue,
    };
  });
  return obj;
}
function isTextFieldOptional(attribute: AttributeModel): boolean {
  return (
    attribute.type.includes("?") ||
    (attribute.default_value_set && attribute.default_value === "")
  );
}
