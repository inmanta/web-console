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
    expect(entity.position()).toEqual({ x: 10, y: 20 });
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
  const relationsDictionary = createRelationsDictionary([parentModel, childModel]);

  it("adds an existing instance as a read-only relation, connected to what is on the canvas", () => {
    const parent = new ServiceEntityShape({
      id: "parent-1",
      entityType: "core",
      serviceModel: parentModel,
      instanceAttributes: {},
      readonly: false,
      isNew: false,
      lockedOnCanvas: false,
      relationsDictionary,
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });
    const instance = {
      id: "child-1",
      service_entity: "child",
      candidate_attributes: null,
      active_attributes: { parent_entity: "parent-1" },
    } as unknown as ServiceInstanceModel;

    const shapes = createInventoryEntityShapes({
      instance,
      serviceModel: childModel,
      position: { x: 0, y: 0 },
      canvasState: new Map([[parent.id, parent]]),
      relationsDictionary,
    });
    const child = shapes.get("child-1")!;

    expect(child.entityType).toBe("relation");
    expect(child.readonly).toBe(true);
    expect(child.isNew).toBe(false);
    expect(child.instanceAttributes.id).toBe("child-1");
    expect(child.connections.get("parent")).toEqual(["parent-1"]);
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
