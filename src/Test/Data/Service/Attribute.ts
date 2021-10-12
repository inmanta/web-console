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

export const list = [a, b, c];

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
