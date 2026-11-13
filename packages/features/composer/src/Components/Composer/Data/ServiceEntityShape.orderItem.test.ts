import { EmbeddedEntity, InterServiceRelation, ServiceModel } from "@inmanta/web-console-core";
import { defineCanvasTestObjects } from "../testSetup";
import { ServiceEntityShape } from "./ServiceEntityShape";

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

const createMockInterServiceRelation = (
  name: string,
  entityType: string,
  overrides: Partial<InterServiceRelation> = {}
): InterServiceRelation => ({
  name,
  entity_type: entityType,
  lower_limit: 0,
  upper_limit: 1,
  modifier: "rw",
  ...overrides,
});

const createMockEmbeddedEntity = (
  name: string,
  type: string,
  overrides: Partial<EmbeddedEntity> = {}
): EmbeddedEntity => ({
  name,
  type,
  lower_limit: 0,
  upper_limit: 1,
  modifier: "rw",
  attributes: [],
  embedded_entities: [],
  inter_service_relations: [],
  ...overrides,
});

describe("ServiceEntityShape order item serialization", () => {
  beforeAll(() => {
    defineCanvasTestObjects();
  });

  it("includes embedded inter-service-relations in parent attributes", () => {
    const embeddedRelation = createMockInterServiceRelation("database", "DatabaseService");
    const embeddedEntity = createMockEmbeddedEntity("child", "ChildType", {
      inter_service_relations: [embeddedRelation],
    });

    const parentModel = createMockServiceModel("ParentService", {
      embedded_entities: [embeddedEntity],
    });
    const relationModel = createMockServiceModel("DatabaseService");

    const parentShape = new ServiceEntityShape({
      id: "core-1",
      entityType: "core",
      serviceModel: parentModel,
      instanceAttributes: {},
      readonly: false,
      isNew: true,
      lockedOnCanvas: false,
      relationsDictionary: {},
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: { ChildType: ["embedded-1"] },
    });

    const embeddedShape = new ServiceEntityShape({
      id: "embedded-1",
      entityType: "embedded",
      serviceModel: embeddedEntity,
      instanceAttributes: {},
      readonly: false,
      isNew: true,
      lockedOnCanvas: false,
      relationsDictionary: {},
      rootEntities: {},
      interServiceRelations: { DatabaseService: ["relation-1"] },
      embeddedEntities: {},
    });

    const relationShape = new ServiceEntityShape({
      id: "relation-1",
      entityType: "relation",
      serviceModel: relationModel,
      instanceAttributes: {},
      readonly: false,
      isNew: true,
      lockedOnCanvas: false,
      relationsDictionary: {},
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });

    const canvasState = new Map<string, ServiceEntityShape>([
      ["core-1", parentShape],
      ["embedded-1", embeddedShape],
      ["relation-1", relationShape],
    ]);

    parentShape.updateOrderItem(canvasState);

    expect(parentShape.orderItem?.attributes).toEqual({
      child: {
        database: "relation-1",
      },
    });
  });

  it("orders only the delete of an instance staged to be deleted", () => {
    const shape = new ServiceEntityShape({
      id: "core-1",
      entityType: "core",
      serviceModel: createMockServiceModel("ParentService"),
      instanceAttributes: { name: "keeps-its-attributes" },
      readonly: false,
      isNew: false,
      lockedOnCanvas: false,
      relationsDictionary: {},
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });

    shape.isMarkedForDeletion = true;
    shape.updateOrderItem(new Map([["core-1", shape]]));

    expect(shape.orderItem).toEqual({
      instance_id: "core-1",
      service_entity: "ParentService",
      config: {},
      action: "delete",
      attributes: null,
      edits: null,
    });
  });

  it("leaves references to an instance staged to be deleted out of the other order items", () => {
    const relation = createMockInterServiceRelation("database", "DatabaseService");
    const parentModel = createMockServiceModel("ParentService", {
      inter_service_relations: [relation],
    });

    const parentShape = new ServiceEntityShape({
      id: "core-1",
      entityType: "core",
      serviceModel: parentModel,
      instanceAttributes: { database: "relation-1" },
      readonly: false,
      isNew: false,
      lockedOnCanvas: false,
      relationsDictionary: {},
      rootEntities: {},
      interServiceRelations: { DatabaseService: ["relation-1"] },
      embeddedEntities: {},
    });
    const relationShape = new ServiceEntityShape({
      id: "relation-1",
      entityType: "relation",
      serviceModel: createMockServiceModel("DatabaseService"),
      instanceAttributes: {},
      readonly: false,
      isNew: false,
      lockedOnCanvas: false,
      relationsDictionary: {},
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });
    const canvasState = new Map<string, ServiceEntityShape>([
      ["core-1", parentShape],
      ["relation-1", relationShape],
    ]);

    parentShape.updateOrderItem(canvasState);

    expect(parentShape.orderItem?.attributes).toMatchObject({ database: "relation-1" });

    relationShape.isMarkedForDeletion = true;
    parentShape.updateOrderItem(canvasState);

    // The deploy deletes the instance, so the parent's update doesn't reference it any more
    expect(parentShape.orderItem?.attributes?.database ?? null).toBeNull();
  });
});
