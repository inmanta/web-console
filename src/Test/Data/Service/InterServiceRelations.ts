import { InterServiceRelation } from "@/Core";

const editable: InterServiceRelation = {
  entity_type: "test_entity",
  modifier: "rw+",
  lower_limit: 0,
  name: "relation1",
  description: "desc",
};

const notEditable: InterServiceRelation = {
  ...editable,
  entity_type: "test_entity2",
  modifier: "rw",
  name: "relation2",
};

const withUpperLimit: InterServiceRelation = {
  ...editable,
  upper_limit: 3,
  name: "relation3",
};

const notEditableUpperLimit: InterServiceRelation = {
  ...notEditable,
  upper_limit: 3,
  name: "relation4",
};

const withLowerAndUpperLimit: InterServiceRelation = {
  ...editable,
  lower_limit: 1,
  upper_limit: 3,
  name: "relation5",
};

const notEditableWithLowerAndUpperLimit: InterServiceRelation = {
  ...notEditable,
  lower_limit: 1,
  upper_limit: 3,
  name: "relation6",
};
const EditableWithLowerAndUpperLimitSetTo1: InterServiceRelation = {
  ...editable,
  lower_limit: 1,
  upper_limit: 1,
  name: "relation7",
};
const notEditableWithLowerAndUpperLimitSetTo1: InterServiceRelation = {
  ...notEditable,
  lower_limit: 1,
  upper_limit: 1,
  name: "relation8",
};

export const listWithAll = [
  editable,
  notEditable,
  withUpperLimit,
  notEditableUpperLimit,
  withLowerAndUpperLimit,
  notEditableWithLowerAndUpperLimit,
  EditableWithLowerAndUpperLimitSetTo1,
  notEditableWithLowerAndUpperLimitSetTo1,
];
