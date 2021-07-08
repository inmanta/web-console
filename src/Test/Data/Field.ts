import { Field } from "@/Core";
import { TextInputTypes } from "@patternfly/react-core";

export const text: Field = {
  kind: "Flat",
  name: "flat_field_text",
  description: "description",
  isOptional: true,
  defaultValue: "",
  inputType: TextInputTypes.text,
  type: "string?",
};

export const bool: Field = {
  kind: "Flat",
  name: "flat_field_boolean",
  description: "description",
  isOptional: true,
  defaultValue: null,
  inputType: "bool",
  type: "bool?",
};

export const number: Field = {
  kind: "Flat",
  name: "flat_field_numbr",
  description: "description",
  isOptional: true,
  defaultValue: "",
  inputType: TextInputTypes.number,
  type: "float",
};

export const nested = (fields: Field[]): Field => ({
  kind: "Nested",
  name: "nested_field",
  description: "description",
  isOptional: true,
  fields,
});

export const dictList = (fields: Field[]): Field => ({
  kind: "DictList",
  name: "dict_list_field",
  description: "description",
  isOptional: true,
  min: 1,
  max: 4,
  fields,
});
