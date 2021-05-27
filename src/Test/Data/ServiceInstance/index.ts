import { ServiceInstanceModelWithTargetStates } from "@/Core";
import * as Environment from "@/Test/Data/Environment";
import * as Service from "@/Test/Data/Service";
import * as Attributes from "./Attributes";

export const a: ServiceInstanceModelWithTargetStates = {
  id: "service_instance_id_a",
  service_identity_attribute_value: "8764848531585023001",
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
};

export const b: ServiceInstanceModelWithTargetStates = {
  ...a,
  id: "service_instance_id_b",
  service_identity_attribute_value: "8764848531585023002",
  state: "rejected",
  candidate_attributes: a.active_attributes,
  active_attributes: null,
};

export const c: ServiceInstanceModelWithTargetStates = {
  ...a,
  id: "service_instance_id_c",
  service_identity_attribute_value: "8764848531585023003",
  state: "acknowledged",
  active_attributes: null,
  rollback_attributes: a.active_attributes,
};
