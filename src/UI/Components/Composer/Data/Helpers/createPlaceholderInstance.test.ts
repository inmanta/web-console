import {
  AttributeModel,
  EmbeddedEntity,
  InterServiceRelation,
  ServiceInstanceModel,
  ServiceModel,
} from "@/Core";
import { applyRequiredConnections, createPlaceholderInstance } from "./createPlaceholderInstance";

const createMockServiceModel = (
  name: string,
  attributes: AttributeModel[] = [],
  overrides: Partial<ServiceModel> = {}
): ServiceModel => ({
  name,
  environment: "test",
  lifecycle: {
    initial_state: "active",
    states: [],
    transfers: [],
  },
  attributes,
  config: {},
  embedded_entities: [],
  inter_service_relations: [],
  owned_entities: [],
  owner: null,
  ...overrides,
});

const createMockEmbeddedEntity = (
  name: string,
  overrides: Partial<EmbeddedEntity> = {}
): EmbeddedEntity => ({
  name,
  type: null,
  modifier: "rw",
  lower_limit: 1,
  upper_limit: 1,
  attributes: [],
  embedded_entities: [],
  inter_service_relations: [],
  ...overrides,
});

const createMockInterServiceRelation = (
  name: string,
  entityType: string,
  overrides: Partial<InterServiceRelation> = {}
): InterServiceRelation => ({
  name,
  entity_type: entityType,
  modifier: "rw",
  lower_limit: 1,
  upper_limit: 1,
  ...overrides,
});

describe("createPlaceholderInstance", () => {
  it("should create a placeholder instance with generated UUID", () => {
    const serviceModel = createMockServiceModel("TestService", [
      {
        name: "name",
        type: "string",
        modifier: "rw",
        default_value: null,
        default_value_set: false,
        validation_type: "pydantic.constr",
        validation_parameters: {},
      },
      {
        name: "description",
        type: "string",
        modifier: "rw",
        default_value: null,
        default_value_set: false,
        validation_type: "pydantic.constr",
        validation_parameters: {},
      },
    ]);

    const result = createPlaceholderInstance(serviceModel, []);

    expect(result.instance.id).toBeDefined();
    expect(result.instance.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(result.instance.service_entity).toBe("TestService");
    expect(result.instance.version).toBe(0);
    expect(result.instance.environment).toBe("");
    expect(result.instance.state).toBe("creating");
    expect(result.instance.deleted).toBe(false);
    expect(result.interServiceRelations).toEqual([]);
  });

  it("should use provided instanceId when given", () => {
    const serviceModel = createMockServiceModel("TestService");
    const customId = "custom-instance-id";

    const result = createPlaceholderInstance(serviceModel, [], customId);

    expect(result.instance.id).toBe(customId);
  });

  it("should initialize all attributes with empty object", () => {
    const serviceModel = createMockServiceModel("TestService", [
      {
        name: "name",
        type: "string",
        modifier: "rw",
        default_value: null,
        default_value_set: false,
        validation_type: "pydantic.constr",
        validation_parameters: {},
      },
      {
        name: "description",
        type: "string",
        modifier: "rw",
        default_value: null,
        default_value_set: false,
        validation_type: "pydantic.constr",
        validation_parameters: {},
      },
      {
        name: "port",
        type: "int",
        modifier: "rw",
        default_value: null,
        default_value_set: false,
        validation_type: "pydantic.conint",
        validation_parameters: { ge: 0, lt: 4096 },
      },
    ]);

    const result = createPlaceholderInstance(serviceModel, []);

    expect(result.instance.candidate_attributes).toEqual({});
  });

  it("should set active_attributes to null", () => {
    const serviceModel = createMockServiceModel("TestService");

    const result = createPlaceholderInstance(serviceModel, []);

    expect(result.instance.active_attributes).toBeNull();
  });

  it("should set rollback_attributes to null", () => {
    const serviceModel = createMockServiceModel("TestService");

    const result = createPlaceholderInstance(serviceModel, []);

    expect(result.instance.rollback_attributes).toBeNull();
  });

  it("should set callback to empty array", () => {
    const serviceModel = createMockServiceModel("TestService");

    const result = createPlaceholderInstance(serviceModel, []);

    expect(result.instance.callback).toEqual([]);
  });

  it("should set referenced_by to null", () => {
    const serviceModel = createMockServiceModel("TestService");

    const result = createPlaceholderInstance(serviceModel, []);

    expect(result.instance.referenced_by).toBeNull();
  });

  it("should set timestamps", () => {
    const serviceModel = createMockServiceModel("TestService");
    const before = new Date().toISOString();

    const result = createPlaceholderInstance(serviceModel, []);

    const after = new Date().toISOString();

    expect(result.instance.created_at).toBeDefined();
    expect(result.instance.last_updated).toBeDefined();
    expect(result.instance.created_at >= before).toBe(true);
    expect(result.instance.created_at <= after).toBe(true);
    expect(result.instance.last_updated >= before).toBe(true);
    expect(result.instance.last_updated <= after).toBe(true);
  });

  it("should handle service model with no attributes", () => {
    const serviceModel = createMockServiceModel("TestService", []);

    const result = createPlaceholderInstance(serviceModel, []);

    expect(result.instance.candidate_attributes).toEqual({});
  });

  it("should populate candidate_attributes for required embedded entities", () => {
    const embedded = createMockEmbeddedEntity("naming", { lower_limit: 1, upper_limit: 1 });
    const serviceModel = createMockServiceModel("TestService", [], {
      embedded_entities: [embedded],
    });

    const result = createPlaceholderInstance(serviceModel, []);

    expect(result.instance.candidate_attributes).toHaveProperty("naming");
    expect(result.instance.candidate_attributes!["naming"]).toEqual({});
  });

  it("should not populate candidate_attributes for optional embedded entities", () => {
    const embedded = createMockEmbeddedEntity("naming", { lower_limit: 0 });
    const serviceModel = createMockServiceModel("TestService", [], {
      embedded_entities: [embedded],
    });

    const result = createPlaceholderInstance(serviceModel, []);

    expect(result.instance.candidate_attributes).not.toHaveProperty("naming");
  });

  it("should create placeholder instances for required inter-service relations", () => {
    const isr = createMockInterServiceRelation("project", "project-service", {
      lower_limit: 1,
      upper_limit: 1,
    });
    const serviceModel = createMockServiceModel("TestService", [], {
      inter_service_relations: [isr],
    });

    const result = createPlaceholderInstance(serviceModel, []);

    expect(result.interServiceRelations).toHaveLength(1);
    expect(result.interServiceRelations[0].service_entity).toBe("project-service");
    expect(result.interServiceRelations[0].state).toBe("creating");
    expect(result.instance.candidate_attributes!["project"]).toBeDefined();
    expect(typeof result.instance.candidate_attributes!["project"]).toBe("string");
  });

  it("should resolve nested ISR connections from catalog", () => {
    const nestedIsr = createMockInterServiceRelation("router", "router-service", {
      lower_limit: 1,
      upper_limit: 1,
    });
    const projectService = createMockServiceModel("project-service", [], {
      inter_service_relations: [nestedIsr],
    });
    const isr = createMockInterServiceRelation("project", "project-service", {
      lower_limit: 1,
      upper_limit: 1,
    });
    const serviceModel = createMockServiceModel("TestService", [], {
      inter_service_relations: [isr],
    });

    const result = createPlaceholderInstance(serviceModel, [projectService]);

    // Should have 2 placeholder instances: project-service and router-service
    expect(result.interServiceRelations).toHaveLength(2);
    const serviceEntities = result.interServiceRelations.map((r) => r.service_entity);
    expect(serviceEntities).toContain("project-service");
    expect(serviceEntities).toContain("router-service");
  });
});

describe("applyRequiredConnections", () => {
  it("should add placeholder object for required embedded entity", () => {
    const attrs: Record<string, unknown> = {};
    const embedded = createMockEmbeddedEntity("naming", { lower_limit: 1, upper_limit: 1 });

    applyRequiredConnections([], [embedded], attrs, [], []);

    expect(attrs).toHaveProperty("naming");
    expect(attrs["naming"]).toEqual({});
  });

  it("should add array of placeholders when lower_limit > 1", () => {
    const attrs: Record<string, unknown> = {};
    const embedded = createMockEmbeddedEntity("naming", { lower_limit: 2, upper_limit: null });

    applyRequiredConnections([], [embedded], attrs, [], []);

    expect(Array.isArray(attrs["naming"])).toBe(true);
    expect((attrs["naming"] as unknown[]).length).toBe(2);
  });

  it("should not add placeholder for optional embedded entity (lower_limit = 0)", () => {
    const attrs: Record<string, unknown> = {};
    const embedded = createMockEmbeddedEntity("naming", { lower_limit: 0 });

    applyRequiredConnections([], [embedded], attrs, [], []);

    expect(attrs).not.toHaveProperty("naming");
  });

  it("should not add placeholder for readonly embedded entity", () => {
    const attrs: Record<string, unknown> = {};
    const embedded = createMockEmbeddedEntity("naming", { lower_limit: 1, modifier: "r" });

    applyRequiredConnections([], [embedded], attrs, [], []);

    expect(attrs).not.toHaveProperty("naming");
  });

  it("should recursively populate nested required embedded entities", () => {
    const attrs: Record<string, unknown> = {};
    const nested = createMockEmbeddedEntity("router", { lower_limit: 1, upper_limit: 1 });
    const embedded = createMockEmbeddedEntity("naming", {
      lower_limit: 1,
      upper_limit: 1,
      embedded_entities: [nested],
    });

    applyRequiredConnections([], [embedded], attrs, [], []);

    expect(attrs).toHaveProperty("naming");
    const namingAttrs = attrs["naming"] as Record<string, unknown>;
    expect(namingAttrs).toHaveProperty("router");
    expect(namingAttrs["router"]).toEqual({});
  });

  it("should add placeholder ID for required inter-service relation", () => {
    const attrs: Record<string, unknown> = {};
    const relations: ServiceInstanceModel[] = [];
    const isr = createMockInterServiceRelation("project", "project-service", {
      lower_limit: 1,
      upper_limit: 1,
    });

    applyRequiredConnections([isr], [], attrs, relations, []);

    expect(typeof attrs["project"]).toBe("string");
    expect(attrs["project"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(relations).toHaveLength(1);
    expect(relations[0].service_entity).toBe("project-service");
    expect(relations[0].state).toBe("creating");
  });

  it("should add array of IDs when ISR lower_limit > 1", () => {
    const attrs: Record<string, unknown> = {};
    const relations: ServiceInstanceModel[] = [];
    const isr = createMockInterServiceRelation("project", "project-service", {
      lower_limit: 2,
      upper_limit: null,
    });

    applyRequiredConnections([isr], [], attrs, relations, []);

    expect(Array.isArray(attrs["project"])).toBe(true);
    expect((attrs["project"] as string[]).length).toBe(2);
    expect(relations).toHaveLength(2);
  });

  it("should not add placeholder for optional inter-service relation", () => {
    const attrs: Record<string, unknown> = {};
    const relations: ServiceInstanceModel[] = [];
    const isr = createMockInterServiceRelation("project", "project-service", { lower_limit: 0 });

    applyRequiredConnections([isr], [], attrs, relations, []);

    expect(attrs).not.toHaveProperty("project");
    expect(relations).toHaveLength(0);
  });

  it("should recursively resolve nested required ISRs from the catalog", () => {
    const attrs: Record<string, unknown> = {};
    const relations: ServiceInstanceModel[] = [];
    const nestedIsr = createMockInterServiceRelation("router", "router-service", {
      lower_limit: 1,
      upper_limit: 1,
    });
    const projectModel = createMockServiceModel("project-service", [], {
      inter_service_relations: [nestedIsr],
    });
    const routerModel = createMockServiceModel("router-service");
    const isr = createMockInterServiceRelation("project", "project-service", {
      lower_limit: 1,
      upper_limit: 1,
    });

    applyRequiredConnections([isr], [], attrs, relations, [projectModel, routerModel]);

    // Both project-service and its nested router-service placeholders are created
    expect(relations).toHaveLength(2);
    const serviceEntities = relations.map((r) => r.service_entity);
    expect(serviceEntities).toContain("project-service");
    expect(serviceEntities).toContain("router-service");

    // project-service's candidate_attributes include the router ISR id
    const projectPlaceholder = relations.find((r) => r.service_entity === "project-service");
    expect(typeof projectPlaceholder!.candidate_attributes!["router"]).toBe("string");
  });
});
