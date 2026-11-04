import { ServiceModel, ServiceInstanceModel } from "@inmanta/web-console-core";
import { InstanceWithRelations } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance/GetInstanceWithRelations";
import { defineCanvasTestObjects } from "../../testSetup";
import { applyLayeredLayout } from "./canvasLayoutUtils";
import { RelationsDictionary } from "./createRelationsDictionary";
import { initializeCanvasFromInstance } from "./initializeCanvasFromInstance";
import { getLinks } from "./linkUtils";

// Mock the layout so the tests see the initial positions
vi.mock("./canvasLayoutUtils", () => ({
  applyLayeredLayout: vi.fn(),
}));

describe("initializeCanvasFromInstance", () => {
  beforeAll(() => {
    defineCanvasTestObjects();
  });

  const createMockServiceModel = (
    name: string,
    overrides: Partial<ServiceModel> = {}
  ): ServiceModel => ({
    name,
    environment: "test",
    lifecycle: {
      initial_state: "active",
      states: [],
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

  const createMockInstance = (
    id: string,
    serviceEntity: string,
    overrides: Partial<ServiceInstanceModel> = {}
  ): ServiceInstanceModel => ({
    id,
    service_entity: serviceEntity,
    version: 0,
    environment: "test-env",
    active_attributes: null,
    candidate_attributes: {},
    rollback_attributes: null,
    callback: [],
    deleted: false,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
    state: "up",
    referenced_by: null,
    ...overrides,
  });

  const createMockInstanceWithRelations = (
    instance: ServiceInstanceModel,
    interServiceRelations: ServiceInstanceModel[] = []
  ): InstanceWithRelations => ({
    instance,
    interServiceRelations,
  });

  it("should create shapes from instance data", () => {
    const serviceModel = createMockServiceModel("TestService");
    const instance = createMockInstance("instance-1", "TestService");
    const instanceData = createMockInstanceWithRelations(instance);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    expect(result.size).toBe(1);
    expect(result.has("instance-1")).toBe(true);
  });

  it("should mark placeholder instances as new", () => {
    const serviceModel = createMockServiceModel("TestService");
    const instance = createMockInstance("instance-1", "TestService", {
      state: "creating",
      active_attributes: null,
    });
    const instanceData = createMockInstanceWithRelations(instance);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    const shape = result.get("instance-1");
    expect(shape?.isNew).toBe(true);
  });

  it("should mark existing instances as not new", () => {
    const serviceModel = createMockServiceModel("TestService");
    const instance = createMockInstance("instance-1", "TestService", {
      state: "up",
      active_attributes: { name: "test" },
    });
    const instanceData = createMockInstanceWithRelations(instance);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    const shape = result.get("instance-1");
    expect(shape?.isNew).toBe(false);
  });

  it("should create shapes for inter-service relations", () => {
    const serviceModel1 = createMockServiceModel("ServiceA");
    const serviceModel2 = createMockServiceModel("ServiceB");
    const instance = createMockInstance("instance-1", "ServiceA");
    const relationInstance = createMockInstance("instance-2", "ServiceB");
    const instanceData = createMockInstanceWithRelations(instance, [relationInstance]);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel1, serviceModel2];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    expect(result.size).toBe(2);
    expect(result.has("instance-1")).toBe(true);
    expect(result.has("instance-2")).toBe(true);
  });

  it("should set core entity type for main instance", () => {
    const serviceModel = createMockServiceModel("TestService");
    const instance = createMockInstance("instance-1", "TestService");
    const instanceData = createMockInstanceWithRelations(instance);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    const shape = result.get("instance-1");
    expect(shape?.entityType).toBe("core");
  });

  it("should set relation entity type for inter-service relations", () => {
    const serviceModel1 = createMockServiceModel("ServiceA");
    const serviceModel2 = createMockServiceModel("ServiceB");
    const instance = createMockInstance("instance-1", "ServiceA");
    const relationInstance = createMockInstance("instance-2", "ServiceB");
    const instanceData = createMockInstanceWithRelations(instance, [relationInstance]);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel1, serviceModel2];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    const shape = result.get("instance-2");
    expect(shape?.entityType).toBe("relation");
  });

  it("should use candidate_attributes when available", () => {
    const serviceModel = createMockServiceModel("TestService");
    const instance = createMockInstance("instance-1", "TestService", {
      candidate_attributes: { name: "test-name", port: 8080 },
    });
    const instanceData = createMockInstanceWithRelations(instance);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    const shape = result.get("instance-1");
    expect(shape?.instanceAttributes).toEqual({ name: "test-name", port: 8080 });
  });

  it("should fallback to active_attributes when candidate_attributes is null", () => {
    const serviceModel = createMockServiceModel("TestService");
    const instance = createMockInstance("instance-1", "TestService", {
      candidate_attributes: null,
      active_attributes: { name: "active-name" },
    });
    const instanceData = createMockInstanceWithRelations(instance);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    const shape = result.get("instance-1");
    expect(shape?.instanceAttributes).toEqual({ name: "active-name" });
  });

  it("should handle missing service model gracefully", () => {
    const instance = createMockInstance("instance-1", "NonExistentService");
    const instanceData = createMockInstanceWithRelations(instance);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [];
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    expect(result.size).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith("Service model not found for NonExistentService");
    consoleSpy.mockRestore();
  });

  it("should position main instance at (100, 100)", () => {
    const serviceModel = createMockServiceModel("TestService");
    const instance = createMockInstance("instance-1", "TestService");
    const instanceData = createMockInstanceWithRelations(instance);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    // The layout is mocked, so this is the position before the layered layout runs
    expect(result.get("instance-1")?.position()).toEqual({ x: 100, y: 100 });
  });

  it("should create links between shapes", () => {
    const embeddedEntity = {
      name: "port",
      type: "Port",
      lower_limit: 0,
      upper_limit: 1,
      modifier: "rw" as const,
      attributes: [],
      embedded_entities: [],
      inter_service_relations: [],
    };
    const serviceModelA = createMockServiceModel("ServiceA", {
      embedded_entities: [embeddedEntity],
      inter_service_relations: [
        {
          name: "service_b",
          entity_type: "ServiceB",
          lower_limit: 0,
          upper_limit: 1,
          modifier: "rw",
        },
      ],
    });
    const serviceModelB = createMockServiceModel("ServiceB");
    const instance = createMockInstance("instance-1", "ServiceA", {
      candidate_attributes: { service_b: "instance-2", port: { name: "p1" } },
    });
    const relationInstance = createMockInstance("instance-2", "ServiceB");
    const instanceData = createMockInstanceWithRelations(instance, [relationInstance]);
    const serviceCatalog: ServiceModel[] = [serviceModelA, serviceModelB];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, {});

    const embeddedId = [...result.values()].find((shape) => shape.entityType === "embedded")?.id;
    expect(embeddedId).toBeDefined();

    // The links follow from the connections, pointing from the parent to the child
    const links = getLinks(result);
    expect(links).toHaveLength(2);
    expect(links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "instance-1", target: "instance-2" }),
        expect.objectContaining({ source: "instance-1", target: embeddedId }),
      ])
    );
  });

  it("should call applyLayeredLayout with the canvas state", () => {
    const serviceModel = createMockServiceModel("TestService");
    const instance = createMockInstance("instance-1", "TestService");
    const instanceData = createMockInstanceWithRelations(instance);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    expect(applyLayeredLayout).toHaveBeenCalledWith(result);
  });

  it("should include all embedded entities of the same type in the root shape connections", () => {
    // Regression: two embedded entity fields sharing the same type ("Port") but different names
    // ("port_a" / "port_b") produced identical connection keys via `entity.type || entity.name`.
    // The old code used `connections.set(key, ids)` which silently overwrote the first batch,
    // leaving only the second batch in the root shape's connections map.
    const createPortEntity = (name: string) => ({
      name,
      type: "Port",
      lower_limit: 0,
      upper_limit: null,
      modifier: "rw" as const,
      attributes: [],
      embedded_entities: [],
      inter_service_relations: [],
    });

    const serviceModel = createMockServiceModel("TestService", {
      embedded_entities: [createPortEntity("port_a"), createPortEntity("port_b")],
    });

    const instance = createMockInstance("instance-1", "TestService", {
      candidate_attributes: {
        port_a: { name: "alpha" },
        port_b: { name: "beta" },
      },
    });

    const instanceData = createMockInstanceWithRelations(instance);
    const serviceCatalog: ServiceModel[] = [serviceModel];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, {});

    // 1 root + 2 embedded shapes
    expect(result.size).toBe(3);

    const rootShape = result.get("instance-1");
    expect(rootShape).toBeDefined();

    const embeddedIds = [...result.entries()]
      .filter(([id, shape]) => id !== "instance-1" && shape.entityType === "embedded")
      .map(([id]) => id);

    expect(embeddedIds).toHaveLength(2);

    // Root shape must reference BOTH embedded shapes under the shared connection key "Port"
    const portConnections = rootShape!.connections.get("Port");
    expect(portConnections).toHaveLength(2);
    expect(portConnections).toContain(embeddedIds[0]);
    expect(portConnections).toContain(embeddedIds[1]);
  });

  it("should skip read-only embedded entities", () => {
    const embeddedEntity = {
      name: "Embedded1",
      type: "EmbeddedType",
      lower_limit: 1,
      upper_limit: 1,
      modifier: "r" as const,
      attributes: [],
      embedded_entities: [],
      inter_service_relations: [],
    };

    const serviceModel = createMockServiceModel("TestService", {
      embedded_entities: [embeddedEntity],
    });
    const instance = createMockInstance("instance-1", "TestService", {
      candidate_attributes: {
        Embedded1: [{ name: "test" }],
      },
    });
    const instanceData = createMockInstanceWithRelations(instance);
    const relationsDictionary: RelationsDictionary = {};
    const serviceCatalog: ServiceModel[] = [serviceModel];

    const result = initializeCanvasFromInstance(instanceData, serviceCatalog, relationsDictionary);

    // Should still create the main shape, but not embedded entities
    expect(result.size).toBe(1);
  });
});
