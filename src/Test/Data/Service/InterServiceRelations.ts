import { InterServiceRelation } from "@/Core";

export const editable: InterServiceRelation = {
  entity_type: "test_entity",
  modifier: "rw+",
  lower_limit: 0,
  name: "relation1",
  description: "desc",
};

export const notEditable: InterServiceRelation = {
  ...editable,
  entity_type: "test_entity2",
  modifier: "rw",
  name: "relation2",
};

export const withUpperLimit: InterServiceRelation = {
  ...editable,
  upper_limit: 3,
  name: "relation3",
};

export const notEditableUpperLimit: InterServiceRelation = {
  ...notEditable,
  upper_limit: 3,
  name: "relation4",
};

export const withLowerAndUpperLimit: InterServiceRelation = {
  ...editable,
  lower_limit: 1,
  upper_limit: 3,
  name: "relation5",
};

export const notEditableWithLowerAndUpperLimit: InterServiceRelation = {
  ...notEditable,
  lower_limit: 1,
  upper_limit: 3,
  name: "relation6",
};

export const listWithAll = [
  editable,
  notEditable,
  withUpperLimit,
  notEditableUpperLimit,
  withLowerAndUpperLimit,
  notEditableWithLowerAndUpperLimit,
];
