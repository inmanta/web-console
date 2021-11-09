import { TextInputTypes } from "@patternfly/react-core";
import { DictListField, Field, FlatField, NestedField } from "@/Core";

export const text: FlatField = {
  kind: "Flat",
  name: "flat_field_text",
  description: "description",
  isOptional: true,
  defaultValue: "",
  inputType: TextInputTypes.text,
  type: "string?",
};

export const bool: FlatField = {
  kind: "Flat",
  name: "flat_field_boolean",
  description: "description",
  isOptional: true,
  defaultValue: null,
  inputType: "bool",
  type: "bool?",
};

export const number: FlatField = {
  kind: "Flat",
  name: "flat_field_numbr",
  description: "description",
  isOptional: true,
  defaultValue: "",
  inputType: TextInputTypes.number,
  type: "float?",
};

export const nested = (fields?: Field[]): NestedField => ({
  kind: "Nested",
  name: "nested_field",
  description: "description",
  isOptional: true,
  fields: fields || [],
});

export const dictList = (fields?: Field[]): DictListField => ({
  kind: "DictList",
  name: "dict_list_field",
  description: "description",
  isOptional: true,
  min: 1,
  max: 4,
  fields: fields || [],
});

export const nestedEditable: Field[] = [
  {
    kind: "Flat",
    name: "id_attr",
    defaultValue: "id",
    inputType: TextInputTypes.text,
    description: "desc",
    type: "string",
    isOptional: false,
  },
  {
    kind: "Flat",
    name: "other_attr1",
    defaultValue: "test",
    inputType: TextInputTypes.text,
    description: "desc",
    type: "string?",
    isOptional: true,
  },
  {
    kind: "Flat",
    name: "other_attr2",
    defaultValue: "",
    inputType: TextInputTypes.text,
    description: "desc",
    type: "dict?",
    isOptional: true,
  },
  {
    kind: "DictList",
    name: "embedded",
    isOptional: true,
    fields: [
      {
        kind: "Flat",
        name: "my_attr",
        defaultValue: "",
        inputType: TextInputTypes.number,
        type: "int",
        isOptional: false,
      },
      {
        kind: "Flat",
        name: "bool_attr",
        defaultValue: null,
        inputType: "bool",
        type: "bool?",
        isOptional: true,
      },
      {
        kind: "Flat",
        name: "dict_attr",
        defaultValue: "",
        inputType: TextInputTypes.text,
        type: "dict",
        isOptional: false,
      },
      {
        kind: "Nested",
        name: "embedded_single",
        isOptional: true,
        fields: [
          {
            kind: "Flat",
            name: "attr4",
            defaultValue: "",
            inputType: TextInputTypes.text,
            type: "int[]",
            isOptional: false,
          },
        ],
      },
    ],
    min: 0,
    max: 2,
  },
  {
    kind: "DictList",
    name: "another_embedded",
    isOptional: true,
    fields: [
      {
        kind: "Flat",
        name: "my_other_attr",
        defaultValue: "",
        inputType: TextInputTypes.text,
        type: "string",
        isOptional: false,
      },
      {
        kind: "Nested",
        name: "another_embedded_single",
        isOptional: true,
        fields: [
          {
            kind: "Flat",
            name: "attr5",
            defaultValue: "",
            inputType: TextInputTypes.number,
            type: "number",
            isOptional: false,
          },
          {
            kind: "Flat",
            name: "attr6",
            defaultValue: "",
            inputType: TextInputTypes.number,
            type: "number",
            isOptional: false,
          },
        ],
      },
    ],
    min: 0,
  },
];
