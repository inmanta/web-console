import {
  AttributeModel,
  EmbeddedEntity,
  ServiceInstanceModel,
  ServiceModel,
} from "@inmanta/web-console-core";

/**
 * The service models of the composer's component tests: a parent service with a required embedded
 * entity, a child service that requires a parent, and a service that relates to nothing.
 */

const stringAttribute = (name: string): AttributeModel => ({
  name,
  type: "string",
  modifier: "rw+",
  description: "",
  default_value_set: false,
  default_value: null,
});

const lifecycleState = (name: string, label: "success" | "danger") => ({
  name,
  label,
  deleted: false,
  export_resources: true,
  purge_resources: false,
});

const service = (name: string, overrides: Partial<ServiceModel> = {}): ServiceModel => ({
  name,
  environment: "env",
  lifecycle: {
    initial_state: "start",
    states: [lifecycleState("up", "success"), lifecycleState("failed", "danger")],
    transfers: [],
  },
  attributes: [],
  config: {},
  embedded_entities: [],
  inter_service_relations: [],
  owned_entities: [],
  owner: null,
  ...overrides,
});

export const settings: EmbeddedEntity = {
  name: "settings",
  type: null,
  description: "",
  modifier: "rw+",
  lower_limit: 1,
  upper_limit: 1,
  attributes: [stringAttribute("vlan")],
  key_attributes: ["vlan"],
  embedded_entities: [],
  inter_service_relations: [],
};

export const parentService = service("parent-service", {
  service_identity: "name",
  key_attributes: ["region"],
  attributes: [stringAttribute("name"), stringAttribute("region")],
  embedded_entities: [settings],
});

export const childService = service("child-service", {
  service_identity: "name",
  attributes: [stringAttribute("name")],
  inter_service_relations: [
    {
      name: "parent_entity",
      entity_type: "parent-service",
      lower_limit: 1,
      upper_limit: 1,
      modifier: "rw+",
      description: "",
    },
  ],
});

/** A service that relates to nothing, so it can't be linked. */
export const standaloneService = service("standalone-service", {
  service_identity: "name",
  attributes: [stringAttribute("name")],
});

export const serviceCatalog = [parentService, childService, standaloneService];

/**
 * An instance of a service in the inventory, with its attributes.
 */
export const inventoryInstance = (
  serviceModel: ServiceModel,
  id: string,
  attributes: Record<string, unknown>,
  overrides: Partial<ServiceInstanceModel> = {}
): ServiceInstanceModel => ({
  id,
  service_identity_attribute_value: String(attributes.name),
  environment: "env",
  service_entity: serviceModel.name,
  version: 1,
  state: "up",
  candidate_attributes: null,
  active_attributes: attributes,
  rollback_attributes: null,
  created_at: "2026-11-13T09:00:00.000000",
  last_updated: "2026-11-13T09:00:00.000000",
  deployment_progress: null,
  callback: [],
  deleted: false,
  referenced_by: [],
  ...overrides,
});
