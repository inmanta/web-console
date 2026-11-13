import { EmbeddedEntity, ServiceInstanceModel, ServiceModel } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../ServiceEntityShape";
import {
  createInventoryEntityShapes,
  createNewEntityShapes,
  getUnavailableInventoryItems,
} from "./addToCanvas";
import { createRelationsDictionary } from "./createRelationsDictionary";

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

const createMockServiceModel = (
  name: string,
  overrides: Partial<ServiceModel> = {}
): ServiceModel => ({
  name,
  environment: "test",
  lifecycle: { initial_state: "active", states: [], transfers: [] },
  attributes: [],
  config: {},
  embedded_entities: [],
  inter_service_relations: [],
  owned_entities: [],
  owner: null,
  ...overrides,
});

describe("createNewEntityShapes", () => {
  it("creates the entity at the position, new, with its required embedded entities", () => {
    const serviceModel = createMockServiceModel("service", {
      embedded_entities: [createMockEmbeddedEntity("child")],
    });
    const catalog = [serviceModel];

    const shapes = createNewEntityShapes({
      serviceModel,
      entityType: "core",
      position: { x: 10, y: 20 },
      serviceCatalog: catalog,
      relationsDictionary: createRelationsDictionary(catalog),
    });
    const [entity, embedded] = Array.from(shapes.values());

    expect(shapes.size).toBe(2);
    expect(entity.isNew).toBe(true);
    expect(entity.getPosition()).toEqual({ x: 10, y: 20 });
    expect(embedded.entityType).toBe("embedded");
    expect(entity.connections.get("child")).toEqual([embedded.id]);
  });

  it("keeps every required embedded entity when two share a type", () => {
    const serviceModel = createMockServiceModel("service", {
      embedded_entities: [
        createMockEmbeddedEntity("first", { type: "Shared" }),
        createMockEmbeddedEntity("second", { type: "Shared" }),
      ],
    });
    const catalog = [serviceModel];

    const shapes = createNewEntityShapes({
      serviceModel,
      entityType: "core",
      position: { x: 0, y: 0 },
      serviceCatalog: catalog,
      relationsDictionary: createRelationsDictionary(catalog),
    });
    const [entity, ...embedded] = Array.from(shapes.values());

    expect(embedded).toHaveLength(2);
    expect(entity.connections.get("Shared")).toEqual(embedded.map((shape) => shape.id));
  });
});

describe("createInventoryEntityShapes", () => {
  const parentModel = createMockServiceModel("parent");
  const childModel = createMockServiceModel("child", {
    inter_service_relations: [
      {
        name: "parent_entity",
        entity_type: "parent",
        modifier: "rw",
        lower_limit: 1,
        upper_limit: 1,
      },
    ],
  });
  const vlanModel = createMockEmbeddedEntity("vlan", { type: "Vlan" });
  const clusterModel = createMockServiceModel("cluster", { embedded_entities: [vlanModel] });
  const catalog = [parentModel, childModel, clusterModel];
  const relationsDictionary = createRelationsDictionary(catalog);

  const createInstance = (
    id: string,
    serviceEntity: string,
    attributes: Record<string, unknown>
  ): ServiceInstanceModel =>
    ({
      id,
      service_entity: serviceEntity,
      candidate_attributes: null,
      active_attributes: attributes,
    }) as unknown as ServiceInstanceModel;

  const parentInstance = createInstance("parent-1", "parent", { name: "parent" });
  const childInstance = createInstance("child-1", "child", { parent_entity: "parent-1" });
  const serviceInventories = { parent: [parentInstance], child: [childInstance] };

  const createExistingShape = (id: string, serviceModel: ServiceModel) =>
    new ServiceEntityShape({
      id,
      entityType: "core",
      serviceModel,
      instanceAttributes: {},
      readonly: false,
      isNew: false,
      lockedOnCanvas: false,
      relationsDictionary,
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });

  const addFromInventory = (
    instance: ServiceInstanceModel,
    serviceModel: ServiceModel,
    canvasState = new Map<string, ServiceEntityShape>(),
    excludedIds?: Set<string>
  ) =>
    createInventoryEntityShapes({
      instance,
      serviceModel,
      position: { x: 500, y: 300 },
      canvasState,
      relationsDictionary,
      serviceCatalog: catalog,
      serviceInventories,
      excludedIds,
    });

  it("adds an existing instance as a read-only relation, connected to what is on the canvas", () => {
    const parent = createExistingShape("parent-1", parentModel);

    const shapes = addFromInventory(childInstance, childModel, new Map([[parent.id, parent]]));
    const child = shapes.get("child-1")!;

    expect(Array.from(shapes.keys())).toEqual(["child-1"]);
    expect(child.entityType).toBe("relation");
    expect(child.readonly).toBe(true);
    expect(child.isNew).toBe(false);
    expect(child.instanceAttributes.id).toBe("child-1");
    expect(child.connections.get("parent")).toEqual(["parent-1"]);
    expect(child.isMissingConnections()).toBe(false);
  });

  it("brings the instances it relates to from the inventory, connected and valid", () => {
    const shapes = addFromInventory(childInstance, childModel);
    const [child, parent] = Array.from(shapes.values());

    expect(Array.from(shapes.keys())).toEqual(["child-1", "parent-1"]);
    expect(parent.entityType).toBe("relation");
    expect(parent.readonly).toBe(true);
    expect(child.connections.get("parent")).toEqual(["parent-1"]);
    expect(child.isMissingConnections()).toBe(false);
  });

  it("keeps a relation the instance has when the related instance can't be brought along", () => {
    const shapes = addFromInventory(childInstance, childModel, new Map(), new Set(["parent-1"]));
    const child = shapes.get("child-1")!;

    expect(Array.from(shapes.keys())).toEqual(["child-1"]);
    expect(child.connections.get("parent")).toEqual(["parent-1"]);
    expect(child.isMissingConnections()).toBe(false);
  });

  it("brings its embedded entities, connected to it", () => {
    const instance = createInstance("cluster-1", "cluster", { vlan: { name: "vlan-1" } });

    const shapes = addFromInventory(instance, clusterModel);
    const [cluster, vlan] = Array.from(shapes.values());

    expect(shapes.size).toBe(2);
    expect(vlan.entityType).toBe("embedded");
    expect(cluster.connections.get("Vlan")).toEqual([vlan.id]);
    expect(cluster.isMissingConnections()).toBe(false);
    expect(vlan.isMissingConnections()).toBe(false);
  });

  it("puts the instance at the position and lays the cluster out clear of the canvas", () => {
    const shapes = addFromInventory(childInstance, childModel);
    const [child, parent] = Array.from(shapes.values());

    expect(child.getPosition()).toEqual({ x: 500, y: 300 });
    expect(parent.getPosition()).not.toEqual(child.getPosition());

    const blocking = createExistingShape("other", parentModel).setPosition(500, 300);
    const moved = addFromInventory(childInstance, childModel, new Map([["other", blocking]]));

    expect(moved.get("child-1")!.getPosition().y).toBeGreaterThan(300);
  });
});

describe("getUnavailableInventoryItems", () => {
  it("marks instances on the canvas, and initial ones that left it for deletion", () => {
    const shape = { instanceAttributes: { id: "instance-a" } } as unknown as ServiceEntityShape;

    const unavailable = getUnavailableInventoryItems(
      new Map([["instance-a", shape]]),
      new Set(["instance-a", "instance-b"])
    );

    expect(unavailable.get("instance-a")).toBe("onCanvas");
    expect(unavailable.get("instance-b")).toBe("markedForDeletion");
  });
});
