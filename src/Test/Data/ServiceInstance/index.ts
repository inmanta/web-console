import { ServiceInstanceModelWithTargetStates } from "@/Core";
import * as Environment from "@/Test/Data/Environment";
import * as Service from "@/Test/Data/Service";
import * as Attributes from "./Attributes";

export const a: ServiceInstanceModelWithTargetStates = {
  id: "service_instance_id_a",
  service_identity_attribute_value: Service.a.name,
  environment: Environment.a.id,
  service_entity: Service.a.name,
  version: 3,
  state: "creating",
  candidate_attributes: null,
  active_attributes: Attributes.a,
  rollback_attributes: null,
  created_at: "2021-01-11T12:55:25.961567",
  last_updated: "2021-01-11T12:55:52.180900",
  deployment_progress: { total: 5, failed: 1, waiting: 2, deployed: 2 },
  callback: [],
  deleted: false,
  instanceSetStateTargets: ["acknowledged", "designed"],
  referenced_by: [],
};

export const b: ServiceInstanceModelWithTargetStates = {
  ...a,
  id: "service_instance_id_b",
  service_identity_attribute_value: Service.b.name,
  state: "rejected",
  candidate_attributes: a.active_attributes,
  active_attributes: null,
};

export const c: ServiceInstanceModelWithTargetStates = {
  ...a,
  id: "service_instance_id_c",
  service_identity_attribute_value: Service.c.name,
  state: "acknowledged",
  active_attributes: null,
  rollback_attributes: a.active_attributes,
};

export const d: ServiceInstanceModelWithTargetStates = {
  ...a,
  service_entity: Service.d.name,
  service_identity_attribute_value: Service.d.name,
};

export const deleted: ServiceInstanceModelWithTargetStates = {
  ...a,
  id: "service_instance_id_d",
  service_identity_attribute_value: Service.d.name,
  state: "terminated",
  deleted: true,
};

export const nestedEditable: ServiceInstanceModelWithTargetStates = {
  id: "2acac4c1-e60b-45d8-914a-812231e73233",
  environment: "d7aae603-e7d4-4b12-a2a1-eaa914c34bc4",
  service_entity: "st",
  version: 1,
  state: "a",
  candidate_attributes: {
    id_attr: "val",
    embedded: [
      {
        my_attr: 0,
        bool_attr: null,
        dict_attr: { a: "b" },
        embedded_single: { attr4: [2, 4] },
      },
    ],
    other_attr1: "test",
    other_attr2: { a: "b" },
    other_attr3: "value3",
    not_editable: { not_editable_attr: 42 },
    another_embedded: [
      {
        my_other_attr: "asdasd",
        another_embedded_single: { attr5: 3.14 },
      },
    ],
  },
  active_attributes: null,
  rollback_attributes: null,
  created_at: "2021-09-07T08:27:28.928987",
  last_updated: "2021-09-07T08:27:28.928987",
  callback: [],
  deleted: false,
  instanceSetStateTargets: [],
  referenced_by: [],
};
export const with_relations: ServiceInstanceModelWithTargetStates = {
  ...a,
  active_attributes: {
    ...Attributes.a,
    test_entity: "2ac3chc1-ee7b-45d8-914a-814f39e7ev33",
  },
  candidate_attributes: {
    ...Attributes.a,
    test_entity: "6a914hc1-9e7e-ee7b-914a-814fee77ev33",
  },
};

export const allAttrs: ServiceInstanceModelWithTargetStates = {
  ...a,
  active_attributes: Attributes.b,
};
