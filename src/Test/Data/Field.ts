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
  defaultValue: "",
  inputType: TextInputTypes.text,
  type: "string?",
};

export const bool: BooleanField = {
  kind: "Boolean",
  name: "boolean_field",
  description: "description",
  isOptional: true,
  defaultValue: null,
  type: "bool?",
};

export const enumField: EnumField = {
  kind: "Enum",
  name: "enum_field",
  description: "description",
  isOptional: false,
  defaultValue: "local",
  options: {
    local: "local",
    ci: "ci",
  },
  type: "string",
};

export const number: TextField = {
  kind: "Text",
  name: "flat_field_numbr",
  description: "description",
  isOptional: true,
  defaultValue: "",
  inputType: TextInputTypes.number,
  type: "float?",
};

export const dictionary: TextField = {
  kind: "Text",
  name: "dictionary_field",
  description: "description",
  isOptional: false,
  defaultValue: {},
  inputType: TextInputTypes.text,
  type: "dict",
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
    kind: "Text",
    name: "id_attr",
    defaultValue: "id",
    inputType: TextInputTypes.text,
    description: "desc",
    type: "string",
    isOptional: false,
  },
  {
    kind: "Text",
    name: "other_attr1",
    defaultValue: "test",
    inputType: TextInputTypes.text,
    description: "desc",
    type: "string?",
    isOptional: true,
  },
  {
    kind: "Text",
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
        kind: "Text",
        name: "my_attr",
        defaultValue: "",
        inputType: TextInputTypes.number,
        type: "int",
        isOptional: false,
      },
      {
        kind: "Boolean",
        name: "bool_attr",
        defaultValue: null,
        type: "bool?",
        isOptional: true,
      },
      {
        kind: "Text",
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
            kind: "Text",
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
        kind: "Text",
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
            kind: "Text",
            name: "attr5",
            defaultValue: "",
            inputType: TextInputTypes.number,
            type: "number",
            isOptional: true,
          },
          {
            kind: "Text",
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

export const InterServiceRelationFields: Field[] = [
  {
    kind: "InterServiceRelation",
    name: "relation7",
    description: "desc",
    isOptional: false,
    serviceEntity: "test_entity",
  },
  {
    kind: "InterServiceRelation",
    name: "relation8",
    description: "desc",
    isOptional: false,
    serviceEntity: "test_entity2",
  },
];

export const RelationListFields: Field[] = [
  {
    kind: "RelationList",
    name: "relation1",
    description: "desc",
    isOptional: true,
    fields: [
      {
        kind: "InterServiceRelation",
        name: "relation1",
        description: "desc",
        isOptional: false,
        serviceEntity: "test_entity",
      },
    ],
    min: 0,
  },
  {
    kind: "RelationList",
    name: "relation2",
    description: "desc",
    isOptional: true,
    fields: [
      {
        kind: "InterServiceRelation",
        name: "relation2",
        description: "desc",
        isOptional: false,
        serviceEntity: "test_entity2",
      },
    ],
    min: 0,
  },
  {
    kind: "RelationList",
    name: "relation3",
    description: "desc",
    isOptional: true,
    fields: [
      {
        kind: "InterServiceRelation",
        name: "relation3",
        description: "desc",
        isOptional: false,
        serviceEntity: "test_entity",
      },
    ],
    min: 0,
    max: 3,
  },
  {
    kind: "RelationList",
    name: "relation4",
    description: "desc",
    isOptional: true,
    fields: [
      {
        kind: "InterServiceRelation",
        name: "relation4",
        description: "desc",
        isOptional: false,
        serviceEntity: "test_entity2",
      },
    ],
    min: 0,
    max: 3,
  },
  {
    kind: "RelationList",
    name: "relation5",
    description: "desc",
    isOptional: false,
    fields: [
      {
        kind: "InterServiceRelation",
        name: "relation5",
        description: "desc",
        isOptional: false,
        serviceEntity: "test_entity",
      },
    ],
    min: 1,
    max: 3,
  },
  {
    kind: "RelationList",
    name: "relation6",
    description: "desc",
    isOptional: false,
    fields: [
      {
        kind: "InterServiceRelation",
        name: "relation6",
        description: "desc",
        isOptional: false,
        serviceEntity: "test_entity2",
      },
    ],
    min: 1,
    max: 3,
  },
];
