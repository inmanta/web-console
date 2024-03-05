import { TextInputTypes } from "@patternfly/react-core";
import {
  DictListField,
  Field,
  NestedField,
  TextField,
  BooleanField,
  EnumField,
} from "@/Core";

export const text: TextField = {
  kind: "Text",
  name: "text_field",
  description: "description",
  isOptional: true,
  isDisabled: false,
  defaultValue: "",
  inputType: TextInputTypes.text,
  type: "string?",
};

export const textDisabled: TextField = {
  kind: "Text",
  name: "text_field_disabled",
  description: "description",
  isOptional: true,
  isDisabled: true,
  defaultValue: "",
  inputType: TextInputTypes.text,
  type: "string?",
};

export const bool: BooleanField = {
  kind: "Boolean",
  name: "boolean_field",
  description: "description",
  isOptional: true,
  isDisabled: false,
  defaultValue: null,
  type: "bool?",
};

export const enumField: EnumField = {
  kind: "Enum",
  name: "enum_field",
  description: "description",
  isOptional: false,
  isDisabled: false,

  defaultValue: "local",
  options: {
    local: "local",
    ci: "ci",
  },
  type: "string",
};
export const enumFieldTwoOptions: EnumField = {
  kind: "Enum",
  name: "enum_field_double",
  description: "description",
  isOptional: false,
  isDisabled: false,

  defaultValue: "",
  options: {
    local: "local",
    local2: "local2",
  },
  type: "string",
};
export const enumFieldSingleOption: EnumField = {
  kind: "Enum",
  name: "enum_field_single",
  description: "description",
  isOptional: false,
  isDisabled: false,

  defaultValue: "",
  options: {
    local: "local",
  },
  type: "string",
};

export const number: TextField = {
  kind: "Text",
  name: "flat_field_numbr",
  description: "description",
  isOptional: true,
  isDisabled: false,
  defaultValue: "",
  inputType: TextInputTypes.number,
  type: "float?",
};

export const dictionary: TextField = {
  kind: "Text",
  name: "dictionary_field",
  description: "description",
  isOptional: false,
  isDisabled: false,

  defaultValue: {},
  inputType: TextInputTypes.text,
  type: "dict",
};

export const nested = (fields?: Field[]): NestedField => ({
  kind: "Nested",
  name: "nested_field",
  description: "description",
  isOptional: true,
  isDisabled: false,
  fields: fields || [],
});

export const dictList = (fields?: Field[]): DictListField => ({
  kind: "DictList",
  name: "dict_list_field",
  description: "description",
  isOptional: true,
  isDisabled: false,
  min: 1,
  max: 4,
  fields: fields || [],
});

export const nestedDictList = (fields?: Field[]): DictListField => ({
  kind: "DictList",
  name: "nested_dict_list_field",
  description: "description",
  isOptional: true,
  isDisabled: false,
  min: 1,
  max: 4,
  fields: [dictList(fields)] || [],
});

export const nestedEditable: Field[] = [
  {
    kind: "Text",
    name: "id_attr",
    defaultValue: "id",
    inputType: TextInputTypes.text,
    description: "desc",
    type: "string",
    isOptional: false,
    isDisabled: false,
  },
  {
    kind: "Text",
    name: "other_attr1",
    defaultValue: "test",
    inputType: TextInputTypes.text,
    description: "desc",
    type: "string?",
    isOptional: true,
    isDisabled: false,
  },
  {
    kind: "Text",
    name: "other_attr2",
    defaultValue: "",
    inputType: TextInputTypes.text,
    description: "desc",
    type: "dict?",
    isOptional: true,
    isDisabled: false,
  },
  {
    kind: "DictList",
    name: "embedded",
    isOptional: true,
    isDisabled: false,
    fields: [
      {
        kind: "Text",
        name: "my_attr",
        defaultValue: "",
        inputType: TextInputTypes.number,
        type: "int",
        isOptional: false,
        isDisabled: false,
      },
      {
        kind: "Boolean",
        name: "bool_attr",
        defaultValue: null,
        type: "bool?",
        isOptional: true,
        isDisabled: false,
      },
      {
        kind: "Text",
        name: "dict_attr",
        defaultValue: "",
        inputType: TextInputTypes.text,
        type: "dict",
        isOptional: false,
        isDisabled: false,
      },
      {
        kind: "Nested",
        name: "embedded_single",
        isOptional: true,
        isDisabled: false,
        fields: [
          {
            kind: "Text",
            name: "attr4",
            defaultValue: "",
            inputType: TextInputTypes.text,
            type: "int[]",
            isOptional: false,
            isDisabled: false,
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
    isDisabled: false,
    fields: [
      {
        kind: "Text",
        name: "my_other_attr",
        defaultValue: "",
        inputType: TextInputTypes.text,
        type: "string",
        isOptional: false,
        isDisabled: false,
      },
      {
        kind: "Nested",
        name: "another_embedded_single",
        isOptional: true,
        isDisabled: false,
        fields: [
          {
            kind: "Text",
            name: "attr5",
            defaultValue: "",
            inputType: TextInputTypes.number,
            type: "number",
            isOptional: true,
            isDisabled: false,
          },
          {
            kind: "Text",
            name: "attr6",
            defaultValue: "",
            inputType: TextInputTypes.number,
            type: "number",
            isOptional: false,
            isDisabled: false,
          },
        ],
      },
    ],
    min: 0,
  },
];

export const InterServiceRelationFields: Field[] = [
  {
    kind: "InterServiceRelation",
    name: "relation7",
    description: "desc",
    isOptional: false,
    isDisabled: false,

    serviceEntity: "test_entity",
  },
  {
    kind: "InterServiceRelation",
    name: "relation8",
    description: "desc",
    isOptional: false,
    isDisabled: false,

    serviceEntity: "test_entity2",
  },
];

export const RelationListFields: Field[] = [
  {
    kind: "RelationList",
    name: "relation1",
    description: "desc",
    isOptional: true,
    isDisabled: false,
    serviceEntity: "test_entity",
    min: 0,
  },
  {
    kind: "RelationList",
    name: "relation2",
    description: "desc",
    isOptional: true,
    isDisabled: false,
    serviceEntity: "test_entity2",
    min: 0,
  },
  {
    kind: "RelationList",
    name: "relation3",
    description: "desc",
    isOptional: true,
    isDisabled: false,
    serviceEntity: "test_entity",
    min: 0,
    max: 3,
  },
  {
    kind: "RelationList",
    name: "relation4",
    description: "desc",
    isOptional: true,
    isDisabled: false,
    serviceEntity: "test_entity2",
    min: 0,
    max: 3,
  },
  {
    kind: "RelationList",
    name: "relation5",
    description: "desc",
    isOptional: false,
    isDisabled: false,

    serviceEntity: "test_entity",
    min: 1,
    max: 3,
  },
  {
    kind: "RelationList",
    name: "relation6",
    description: "desc",
    isOptional: false,
    isDisabled: false,

    serviceEntity: "test_entity2",
    min: 1,
    max: 3,
  },
];
