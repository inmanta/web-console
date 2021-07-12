import { ServiceModel } from "@/Core";
import * as Environment from "@/Test/Data/Environment";
import * as Attribute from "./Attribute";
import * as EmbeddedEntity from "./EmbeddedEntity";
import * as State from "./State";
import * as Transfer from "./Transfer";
import * as InstanceSummary from "./InstanceSummary";

export const a: ServiceModel = {
  environment: Environment.a.id,
  name: "service_name_a",
  description: "description of service",
  attributes: Attribute.list,
  lifecycle: {
    states: State.list,
    transfers: Transfer.list,
    initial_state: "start",
  },
  config: {
    auto_creating: true,
    auto_designed: true,
    auto_update_designed: true,
    auto_update_inprogress: true,
  },
  embedded_entities: EmbeddedEntity.list,
};

export const b: ServiceModel = {
  ...a,
  name: "service_name_b",
};

export const c: ServiceModel = {
  ...a,
  name: "service_name_c",
};

export const withIdentity: ServiceModel = {
  ...a,
  name: "service_name_d",
  service_identity: "order_id",
  service_identity_display_name: "Order ID",
};

export const withInstanceSummary: ServiceModel = {
  ...a,
  name: "service_name_e",
  instance_summary: InstanceSummary.a,
};
