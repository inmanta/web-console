import { ServiceInstanceModel } from "@/Core";
import * as Environment from "@/Test/Data/Environment";
import * as Service from "@/Test/Data/Service";
import * as Attributes from "./Attributes";

export const a: ServiceInstanceModel = {
  id: "service_instance_id_a",
  environment: Environment.a.id,
  service_entity: Service.a.name,
  version: 3,
  state: "creating",
  candidate_attributes: null,
  active_attributes: Attributes.a,
  rollback_attributes: null,
  created_at: "2021-01-11T12:55:25.961567",
  last_updated: "2021-01-11T12:55:52.180900",
  callback: [],
  deleted: false,
};

export const b: ServiceInstanceModel = {
  ...a,
  id: "service_instance_id_b",
  state: "rejected",
  candidate_attributes: a.active_attributes,
  active_attributes: null,
};

export const deleted: ServiceInstanceModel = {
  ...a,
  id: "service_instance_id_deleted",
  state: "terminated",
  deleted: true,
};
