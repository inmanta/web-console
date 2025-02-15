import { ServiceModel } from "@/Core";
import * as Environment from "@/Test/Data/Environment";
import * as Attribute from "./Attribute";
import * as EmbeddedEntity from "./EmbeddedEntity";
import * as InstanceSummary from "./InstanceSummary";
import * as State from "./State";
import * as Transfer from "./Transfer";
export * as InterServiceRelations from "./InterServiceRelations";

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
  owner: null,
  owned_entities: [],
  inter_service_relations: [],
};

export const b: ServiceModel = {
  ...a,
  name: "service_name_b",
};

export const c: ServiceModel = {
  ...a,
  name: "service_name_c",
};

export const d: ServiceModel = {
  ...a,
  name: "service_name_d",
  strict_modifier_enforcement: true,
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

export const nestedEditable: ServiceModel = {
  attributes: Attribute.nestedEditable,
  embedded_entities: EmbeddedEntity.nestedEditable,
  inter_service_relations: [
    { name: "related", entity_type: "subnet", lower_limit: 0, modifier: "rw" },
  ],
  environment: "36d188da-a30d-411b-892f-35808ad9b6e1",
  name: "test_service",
  description: "Description of test service",
  lifecycle: {
    states: State.nestedEditable,
    transfers: Transfer.nestedEditable,
    initial_state: "a",
    name: "testservice",
  },
  config: {},
  instance_summary: {
    by_state: { b: 0, a: 1 },
    by_label: { no_label: 0, info: 0, success: 0, danger: 0, warning: 0 },
    total: 1,
  },
  owner: null,
  owned_entities: [],
};

export const withRelationsOnly: ServiceModel = {
  ...a,
  name: "with_relations",
  attributes: [],
  embedded_entities: [],
  inter_service_relations: [
    {
      name: "test_entity",
      description: "test-case",
      lower_limit: 1,
      modifier: "rw+",
      entity_type: "test_entity",
      upper_limit: 5,
    },
  ],
  service_identity: "subscriber_number",
  service_identity_display_name: "User Equipment",
};

const allTypesOfAttributes: ServiceModel = {
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
  inter_service_relations: [],
  owner: null,
  owned_entities: [],
};

export const ServiceWithAllAttrs: ServiceModel = {
  ...allTypesOfAttributes,
  name: "service_name_all_attrs",
  attributes: Attribute.attributesList,
  embedded_entities: [
    EmbeddedEntity.embedded_base,
    EmbeddedEntity.editableEmbedded_base,
    EmbeddedEntity.optionalEmbedded_base,
    EmbeddedEntity.editableOptionalEmbedded_base,
  ],
};
