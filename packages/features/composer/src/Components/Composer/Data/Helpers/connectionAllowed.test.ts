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
      isNew: true,
      relationsDictionary,
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });

  it("should return false when targetShape is undefined", () => {
    const sourceShape = createShape("source-1", "ServiceA");

    const result = checkIfConnectionIsAllowed(
      sourceShape,
      undefined,
      bothWaysDictionary,
      new Map()
    );

    expect(result).toBe(false);
  });

  it("should return false when source and target are the same", () => {
    const shape = createShape("same-1", "ServiceA");

    const result = checkIfConnectionIsAllowed(shape, shape, bothWaysDictionary, new Map());

    expect(result).toBe(false);
  });

  it("should return false when no relations exist in dictionary", () => {
    const sourceShape = createShape("source-1", "ServiceA", {});
    const targetShape = createShape("target-1", "ServiceB", {});

    const result = checkIfConnectionIsAllowed(sourceShape, targetShape, {}, new Map());

    expect(result).toBe(false);
  });

  it("should return false when shapes are already connected", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-1", "ServiceB");
    sourceShape.addConnection("target-1", "ServiceB");
    const validateSpy = vi.spyOn(sourceShape, "validateConnection");

    const result = checkIfConnectionIsAllowed(
      sourceShape,
      targetShape,
      bothWaysDictionary,
      new Map()
    );

    expect(result).toBe(false);
    // The "already connected" check short-circuits before validation
    expect(validateSpy).not.toHaveBeenCalled();
  });

  it("should return true when connection is allowed from both sides", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-1", "ServiceB");
    const sourceSpy = vi.spyOn(sourceShape, "validateConnection");
    const targetSpy = vi.spyOn(targetShape, "validateConnection");

    const result = checkIfConnectionIsAllowed(
      sourceShape,
      targetShape,
      bothWaysDictionary,
      new Map()
    );

    expect(result).toBe(true);
    expect(sourceSpy).toHaveBeenCalledWith(targetShape, expect.any(Map));
    expect(targetSpy).toHaveBeenCalledWith(sourceShape, expect.any(Map));
  });

  it("should match dictionary keys case-insensitively", () => {
    const dictionary: RelationsDictionary = {
      servicea: { serviceb: { lower_limit: 0, upper_limit: null } },
      serviceb: { servicea: { lower_limit: 0, upper_limit: null } },
    };
    const sourceShape = createShape("source-1", "ServiceA", dictionary);
    const targetShape = createShape("target-1", "ServiceB", dictionary);

    const result = checkIfConnectionIsAllowed(sourceShape, targetShape, dictionary, new Map());

    expect(result).toBe(true);
  });

  it("should return false when source validation fails", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-1", "ServiceB");
    vi.spyOn(sourceShape, "validateConnection").mockReturnValue(false);

    const result = checkIfConnectionIsAllowed(
      sourceShape,
      targetShape,
      bothWaysDictionary,
      new Map()
    );

    expect(result).toBe(false);
  });

  it("should return false when target validation fails", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-1", "ServiceB");
    vi.spyOn(targetShape, "validateConnection").mockReturnValue(false);

    const result = checkIfConnectionIsAllowed(
      sourceShape,
      targetShape,
      bothWaysDictionary,
      new Map()
    );

    expect(result).toBe(false);
  });

  it("should return false when the source has reached its upper limit", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-2", "ServiceB");
    sourceShape.addConnection("target-1", "ServiceB");

    const result = checkIfConnectionIsAllowed(
      sourceShape,
      targetShape,
      bothWaysDictionary,
      new Map()
    );

    expect(result).toBe(false);
  });

  it("should refuse a connection to or from a shape staged to be deleted", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const targetShape = createShape("target-1", "ServiceB");
    const canvasState = new Map([
      [sourceShape.id, sourceShape],
      [targetShape.id, targetShape],
    ]);

    targetShape.isMarkedForDeletion = true;
    expect(
      checkIfConnectionIsAllowed(sourceShape, targetShape, bothWaysDictionary, canvasState)
    ).toBe(false);
    expect(
      checkIfConnectionIsAllowed(targetShape, sourceShape, bothWaysDictionary, canvasState)
    ).toBe(false);
  });

  it("should not count a shape staged to be deleted for the upper limit", () => {
    const sourceShape = createShape("source-1", "ServiceA");
    const deletedShape = createShape("deleted-1", "ServiceB");
    const targetShape = createShape("target-1", "ServiceB");
    const canvasState = new Map([
      [sourceShape.id, sourceShape],
      [deletedShape.id, deletedShape],
      [targetShape.id, targetShape],
    ]);

    sourceShape.addConnection(deletedShape.id, "ServiceB");
    expect(
      checkIfConnectionIsAllowed(sourceShape, targetShape, bothWaysDictionary, canvasState)
    ).toBe(false);

    deletedShape.isMarkedForDeletion = true;
    expect(
      checkIfConnectionIsAllowed(sourceShape, targetShape, bothWaysDictionary, canvasState)
    ).toBe(true);
  });
});
