import { EmbeddedEntity, InterServiceRelation, ServiceModel } from "@/Core";
import { defineObjectsForJointJS } from "../../testSetup";
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
    defineObjectsForJointJS();
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
});
