import { EmbeddedEntity, InterServiceRelation, ServiceModel } from "@inmanta/web-console-core";
import { createRelationsDictionary } from "./Helpers/createRelationsDictionary";
import { EntityShapeType, ServiceEntityShape } from "./ServiceEntityShape";

const createService = (name: string, overrides: Partial<ServiceModel> = {}): ServiceModel => ({
  name,
  environment: "test",
  lifecycle: { initial_state: "start", states: [], transfers: [] },
  attributes: [],
  config: {},
  embedded_entities: [],
  inter_service_relations: [],
  owned_entities: [],
  owner: null,
  ...overrides,
});

const createRelation = (entityType: string, modifier: string): InterServiceRelation => ({
  name: `${entityType}_ref`,
  entity_type: entityType,
  lower_limit: 0,
  upper_limit: 1,
  modifier,
});

const createEmbedded = (name: string, modifier: string): EmbeddedEntity => ({
  name,
  type: null,
  attributes: [],
  embedded_entities: [],
  inter_service_relations: [],
  lower_limit: 0,
  upper_limit: 2,
  modifier,
});

/**
 * Creates a shape of the given model, with the relations dictionary of the whole catalog.
 */
const createShape = (
  catalog: ServiceModel[],
  serviceModel: ServiceModel | EmbeddedEntity,
  entityType: EntityShapeType = "core",
  isNew = true
): ServiceEntityShape =>
  new ServiceEntityShape({
    id: serviceModel.name,
    entityType,
    serviceModel,
    instanceAttributes: {},
    readonly: false,
    isNew,
    lockedOnCanvas: false,
    relationsDictionary: createRelationsDictionary(catalog),
    rootEntities: {},
    interServiceRelations: {},
    embeddedEntities: {},
  });

describe("ServiceEntityShape.canHaveConnections", () => {
  it("is false for a service that relates to nothing and that nothing relates to", () => {
    const standalone = createService("standalone");
    const other = createService("other");

    expect(createShape([standalone, other], standalone).canHaveConnections()).toBe(false);
  });

  it("is true for a service with an inter-service relation, and for the service it points to", () => {
    const parent = createService("parent");
    const child = createService("child", {
      inter_service_relations: [createRelation("parent", "rw+")],
    });
    const catalog = [parent, child];

    expect(createShape(catalog, child).canHaveConnections()).toBe(true);
    expect(createShape(catalog, parent).canHaveConnections()).toBe(true);
  });

  it("is false when the only relation is read-only", () => {
    const parent = createService("parent");
    const child = createService("child", {
      inter_service_relations: [createRelation("parent", "r")],
    });
    const catalog = [parent, child];

    expect(createShape(catalog, child).canHaveConnections()).toBe(false);
    expect(createShape(catalog, parent).canHaveConnections()).toBe(false);
  });

  it("is true for an embedded entity that can belong to a parent, and for that parent", () => {
    const embedded = createEmbedded("disk", "rw+");
    const container = createService("container", { embedded_entities: [embedded] });
    const catalog = [container];

    expect(createShape(catalog, container).canHaveConnections()).toBe(true);
    expect(createShape(catalog, embedded, "embedded").canHaveConnections()).toBe(true);
  });

  it("is false for a parent whose only embedded entity is read-only", () => {
    const embedded = createEmbedded("disk", "r");
    const container = createService("container", { embedded_entities: [embedded] });

    expect(createShape([container], container).canHaveConnections()).toBe(false);
  });

  it("is false for an existing instance whose only relation is set on creation (rw)", () => {
    const parent = createService("parent");
    const child = createService("child", {
      inter_service_relations: [createRelation("parent", "rw")],
    });
    const catalog = [parent, child];

    expect(createShape(catalog, child, "core", true).canHaveConnections()).toBe(true);
    expect(createShape(catalog, child, "core", false).canHaveConnections()).toBe(false);
  });

  it("doesn't depend on the connections on the canvas", () => {
    const parent = createService("parent");
    const child = createService("child", {
      inter_service_relations: [createRelation("parent", "rw+")],
    });
    const catalog = [parent, child];
    const childShape = createShape(catalog, child);
    const parentShape = createShape(catalog, parent);

    // The relation allows one parent, which is already linked
    childShape.addConnection(parentShape.id, "parent");
    parentShape.addConnection(childShape.id, "child");

    expect(childShape.validateConnection(createShape(catalog, parent))).toBe(false);
    expect(childShape.canHaveConnections()).toBe(true);
  });
});
