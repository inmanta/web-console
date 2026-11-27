import { EmbeddedEntity, ServiceModel } from "@inmanta/web-console-core";
import { addConnectionsBetweenShapes } from "./Helpers/connectionUtils";
import { createRelationsDictionary } from "./Helpers/createRelationsDictionary";
import { EntityShapeType, ServiceEntityShape } from "./ServiceEntityShape";

const createEmbedded = (name: string, lowerLimit: number): EmbeddedEntity => ({
  name,
  type: null,
  attributes: [],
  embedded_entities: [],
  inter_service_relations: [],
  lower_limit: lowerLimit,
  upper_limit: 2,
  modifier: "rw+",
});

const createService = (name: string, embedded: EmbeddedEntity[]): ServiceModel => ({
  name,
  environment: "test",
  lifecycle: { initial_state: "start", states: [], transfers: [] },
  attributes: [],
  config: {},
  embedded_entities: embedded,
  inter_service_relations: [],
  owned_entities: [],
  owner: null,
});

const createShape = (
  catalog: ServiceModel[],
  serviceModel: ServiceModel | EmbeddedEntity,
  entityType: EntityShapeType
): ServiceEntityShape =>
  new ServiceEntityShape({
    id: serviceModel.name,
    entityType,
    serviceModel,
    instanceAttributes: {},
    isNew: true,
    relationsDictionary: createRelationsDictionary(catalog),
    rootEntities: {},
    interServiceRelations: {},
    embeddedEntities: {},
  });

describe("ServiceEntityShape missing connections", () => {
  it.each([0, 1])(
    "an embedded entity on its own needs a parent, also when the parent's lower limit is %i",
    (lowerLimit) => {
      const embedded = createEmbedded("child", lowerLimit);
      const service = createService("parent", [embedded]);
      const child = createShape([service], embedded, "embedded");

      expect(child.getMissingConnections(new Map())).toEqual([
        expect.objectContaining({ type: "parent", name: "parent", missing: 1, required: 1 }),
      ]);
      expect(child.isMissingConnections(new Map())).toBe(true);
    }
  );

  it("an embedded entity in its parent misses nothing", () => {
    const embedded = createEmbedded("child", 0);
    const service = createService("parent", [embedded]);
    const parent = createShape([service], service, "core");
    const child = createShape([service], embedded, "embedded");

    addConnectionsBetweenShapes(parent, child);

    expect(child.getMissingConnections(new Map())).toEqual([]);
    expect(child.isMissingConnections(new Map())).toBe(false);
  });

  it("agrees with the list of missing connections for a parent missing a required child", () => {
    const embedded = createEmbedded("child", 1);
    const service = createService("parent", [embedded]);
    const parent = createShape([service], service, "core");

    expect(parent.getMissingConnections(new Map())).toEqual([
      expect.objectContaining({ type: "embedded", name: "child", missing: 1, required: 1 }),
    ]);
    expect(parent.isMissingConnections(new Map())).toBe(true);
  });
});
