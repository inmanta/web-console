import { ServiceModel } from "@inmanta/web-console-core";
import { defineCanvasTestObjects } from "../../testSetup";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { checkIfConnectionIsAllowed } from "./connectionAllowed";
import { RelationsDictionary } from "./createRelationsDictionary";

describe("checkIfConnectionIsAllowed", () => {
  beforeAll(() => {
    defineCanvasTestObjects();
  });

  const bothWaysDictionary: RelationsDictionary = {
    ServiceA: { ServiceB: { lower_limit: 1, upper_limit: 1 } },
    ServiceB: { ServiceA: { lower_limit: 1, upper_limit: 1 } },
  };

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

  const createShape = (
    id: string,
    entityName: string,
    relationsDictionary: RelationsDictionary = bothWaysDictionary
  ): ServiceEntityShape =>
    new ServiceEntityShape({
      id,
      entityType: "core",
      serviceModel: createMockServiceModel(entityName),
      instanceAttributes: {},
      readonly: false,
      isNew: true,
      lockedOnCanvas: false,
      relationsDictionary,
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });

  it("should return false when targetShape is undefined", () => {
    const sourceShape = createShape("source-1", "ServiceA");

    const result = checkIfConnectionIsAllowed(sourceShape, undefined, bothWaysDictionary);

    expect(result).toBe(false);
  });

  it("should return false when source and target are the same", () => {
    const shape = createShape("same-1", "ServiceA");

    const result = checkIfConnectionIsAllowed(shape, shape, bothWaysDictionary);

    expect(result).toBe(false);
  });

  it("should return false when no relations exist in dictionary", () => {
    const sourceShape = createShape("source-1", "ServiceA", {});
    const targetShape = createShape("target-1", "ServiceB", {});

    const result = checkIfConnectionIsAllowed(sourceShape, targetShape, {});

    expect(result).toBe(false);
  });

  it("should return false when shapes are already connected", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-1", "ServiceB");
    sourceShape.addConnection("target-1", "ServiceB");
    const validateSpy = vi.spyOn(sourceShape, "validateConnection");

    const result = checkIfConnectionIsAllowed(sourceShape, targetShape, bothWaysDictionary);

    expect(result).toBe(false);
    // The "already connected" check short-circuits before validation
    expect(validateSpy).not.toHaveBeenCalled();
  });

  it("should return true when connection is allowed from both sides", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-1", "ServiceB");
    const sourceSpy = vi.spyOn(sourceShape, "validateConnection");
    const targetSpy = vi.spyOn(targetShape, "validateConnection");

    const result = checkIfConnectionIsAllowed(sourceShape, targetShape, bothWaysDictionary);

    expect(result).toBe(true);
    expect(sourceSpy).toHaveBeenCalledWith(targetShape);
    expect(targetSpy).toHaveBeenCalledWith(sourceShape);
  });

  it("should match dictionary keys case-insensitively", () => {
    const dictionary: RelationsDictionary = {
      servicea: { serviceb: { lower_limit: 0, upper_limit: null } },
      serviceb: { servicea: { lower_limit: 0, upper_limit: null } },
    };
    const sourceShape = createShape("source-1", "ServiceA", dictionary);
    const targetShape = createShape("target-1", "ServiceB", dictionary);

    const result = checkIfConnectionIsAllowed(sourceShape, targetShape, dictionary);

    expect(result).toBe(true);
  });

  it("should return false when source validation fails", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-1", "ServiceB");
    vi.spyOn(sourceShape, "validateConnection").mockReturnValue(false);

    const result = checkIfConnectionIsAllowed(sourceShape, targetShape, bothWaysDictionary);

    expect(result).toBe(false);
  });

  it("should return false when target validation fails", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-1", "ServiceB");
    vi.spyOn(targetShape, "validateConnection").mockReturnValue(false);

    const result = checkIfConnectionIsAllowed(sourceShape, targetShape, bothWaysDictionary);

    expect(result).toBe(false);
  });

  it("should return false when the source has reached its upper limit", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-2", "ServiceB");
    sourceShape.addConnection("target-1", "ServiceB");

    const result = checkIfConnectionIsAllowed(sourceShape, targetShape, bothWaysDictionary);

    expect(result).toBe(false);
  });
});
