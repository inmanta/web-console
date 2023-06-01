import { AttributeModel } from "@/Core";

export const a: AttributeModel = {
  name: "bandwidth",
  type: "e2e::bandwidth_t",
  modifier: "rw+",
  description: "The bandwidth of the e-line",
  default_value_set: false,
  default_value: null,
};

export const b: AttributeModel = {
  name: "customer_locations",
  type: "string",
  modifier: "rw",
  description:
    "A list of customer location IDS where the service should be delivered.",
  default_value_set: false,
  default_value: null,
};

export const c: AttributeModel = {
  name: "order_id",
  type: "string",
  modifier: "rw",
  description: "ID of the service",
  default_value_set: true,
  default_value: "1234",
};

export const d: AttributeModel = {
  default_value: null,
  default_value_set: false,
  description: "The release of the orchestrator to install in the lab",
  modifier: "rw",
  name: "iso_release",
  type: "string",
  validation_parameters: {
    names: { dev: "dev", next: "next", stable: "stable" },
    value: "iso_release_t",
  },
  validation_type: "enum",
};

export const e: AttributeModel = {
  default_value: "local",
  default_value_set: true,
  description: "The network this orchestrator should reside on.",
  modifier: "rw",
  name: "network",
  type: "string",
  validation_parameters: {
    names: { ci: "ci", local: "local" },
    value: "infra_network",
  },
  validation_type: "enum",
};

export const list = [a, b, c, d, e];

export const nestedEditable: AttributeModel[] = [
  {
    name: "id_attr",
    description: "desc",
    modifier: "rw+",
    type: "string",
    default_value: "id",
    default_value_set: true,
    validation_type: null,
    validation_parameters: null,
  },
  {
    name: "other_attr1",
    description: "desc",
    modifier: "rw+",
    type: "string?",
    default_value: "test",
    default_value_set: true,
    validation_type: null,
    validation_parameters: null,
  },
  {
    name: "other_attr2",
    description: "desc",
    modifier: "rw+",
    type: "dict?",
    default_value: null,
    default_value_set: true,
    validation_type: null,
    validation_parameters: null,
  },
];

//By default all attributes created below have rw modifier

// String Attributes
const string: AttributeModel = {
  name: "string",
  type: "string",
  modifier: "rw",
  description: "description",
  default_value: null,
  default_value_set: true,
};
const editableString: AttributeModel = {
  ...string,
  name: "editableString",
  modifier: "rw+",
};
const optionalString: AttributeModel = {
  ...string,
  name: "string?",
  type: "string?",
};
const editableOptionalString: AttributeModel = {
  ...optionalString,
  name: "editableString?",
  modifier: "rw+",
};

//Boolean Attributes
const boolean: AttributeModel = {
  name: "bool",
  type: "bool",
  modifier: "rw",
  description: "description",
  default_value: null,
  default_value_set: true,
};
const editableBoolean: AttributeModel = {
  ...boolean,
  name: "editableBool",
  modifier: "rw+",
};
const optionalBoolean: AttributeModel = {
  ...boolean,
  name: "bool?",
  type: "bool?",
};
const editableOptionalBoolean: AttributeModel = {
  ...optionalBoolean,
  name: "editableBool?",
  modifier: "rw+",
};

//TextList Attributes
const textList: AttributeModel = {
  name: "string[]",
  type: "string[]",
  modifier: "rw",
  description: "description",
  default_value: null,
  default_value_set: true,
};
const editableTextList: AttributeModel = {
  ...textList,
  name: "editableString[]",
  modifier: "rw+",
};
const optionalTextList: AttributeModel = {
  ...textList,
  name: "string[]?",
  type: "string[]?",
};
const editableOptionalTextList: AttributeModel = {
  ...optionalTextList,
  name: "editableString[]?",
  modifier: "rw+",
};

//Enum Attributes
const enumAttr: AttributeModel = {
  name: "enum",
  type: "string",
  modifier: "rw",
  description: "description",
  default_value: null,
  default_value_set: true,
  validation_type: "enum",
  validation_parameters: {
    names: { OPTION_ONE: "OPTION_ONE", OPTION_TWO: "OPTION_TWO" },
    value: "value",
  },
};
const editableEnum: AttributeModel = {
  ...enumAttr,
  name: "editableEnum",
  modifier: "rw+",
};
const optionalEnum: AttributeModel = {
  ...enumAttr,
  name: "enum?",
  type: "string?",
  validation_type: "enum?",
};
const editableOptionalEnum: AttributeModel = {
  ...optionalEnum,
  name: "editableEnum?",
  modifier: "rw+",
};

//Dict attributes

const dict: AttributeModel = {
  name: "dict",
  modifier: "rw",
  type: "dict",
  default_value: null,
  default_value_set: false,
  validation_type: null,
  validation_parameters: null,
};
const editableDict: AttributeModel = {
  ...dict,
  name: "editableDict",
  modifier: "rw+",
};
const optionalDict: AttributeModel = {
  ...dict,
  name: "dict?",
  type: "dict?",
};
const editableOptionalDict: AttributeModel = {
  ...dict,
  name: "editableDict?",
  modifier: "rw+",
};

export const attributesList = [
  string,
  editableString,
  optionalString,
  editableOptionalString,
  boolean,
  editableBoolean,
  optionalBoolean,
  editableOptionalBoolean,
  textList,
  editableTextList,
  optionalTextList,
  editableOptionalTextList,
  enumAttr,
  editableEnum,
  optionalEnum,
  editableOptionalEnum,
  dict,
  editableDict,
  optionalDict,
  editableOptionalDict,
];
