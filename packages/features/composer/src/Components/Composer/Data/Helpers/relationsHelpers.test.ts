import { ServiceModel, EmbeddedEntity, InterServiceRelation } from "@inmanta/web-console-core";
import { defineCanvasTestObjects } from "../../testSetup";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { RelationsDictionary } from "./createRelationsDictionary";
import {
  findFullInterServiceRelations,
  findParentShapeForEmbedded,
  getRelationInfo,
  canRemoveShape,
  canRemoveLink,
  getRemoveActions,
  canUndoDelete,
} from "./relationsHelpers";

describe("relationsHelpers", () => {
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

  const createMockEmbeddedEntity = (
    name: string,
    type: string,
    overrides: Partial<EmbeddedEntity> = {}
  ): EmbeddedEntity => ({
    name,
    type,
    lower_limit: 1,
    upper_limit: 1,
    modifier: "rw",
    attributes: [],
    embedded_entities: [],
    inter_service_relations: [],
    ...overrides,
  });

  const createMockInterServiceRelation = (
    name: string,
    entityType: string,
    modifier: string = "rw"
  ): InterServiceRelation => ({
    name,
    entity_type: entityType,
    lower_limit: 1,
    upper_limit: 1,
    modifier,
  });

  /**
   * Creates a shape whose entity type is the service model's type (or name).
   */
  const createMockShape = (
    id: string,
    entityType: "core" | "embedded" | "relation" = "core",
    isNew: boolean = false,
    connections: Map<string, string[]> = new Map(),
    serviceModel: ServiceModel | EmbeddedEntity
  ): ServiceEntityShape => {
    const shape = new ServiceEntityShape({
      id,
      entityType,
      serviceModel,
      instanceAttributes: {},
      isNew,
      relationsDictionary: {},
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });

    shape.connections = connections;

    return shape;
  };

  const toCanvas = (...shapes: ServiceEntityShape[]): Map<string, ServiceEntityShape> =>
    new Map(shapes.map((shape) => [shape.id, shape]));

  describe("findFullInterServiceRelations", () => {
    it("should return full inter-service relation objects", () => {
      const relation1 = createMockInterServiceRelation("rel1", "ServiceB");
      const relation2 = createMockInterServiceRelation("rel2", "ServiceC");
      const serviceModel = createMockServiceModel("ServiceA", {
        inter_service_relations: [relation1, relation2],
      });

      const result = findFullInterServiceRelations(serviceModel);

      expect(result).toEqual([relation1, relation2]);
    });

    it("should recursively find relations from embedded entities", () => {
      const relation = createMockInterServiceRelation("rel1", "ServiceB");
      const serviceModel = createMockServiceModel("ServiceA", {
        embedded_entities: [
          createMockEmbeddedEntity("Embedded1", "EmbeddedType", {
            inter_service_relations: [relation],
          }),
        ],
      });

      const result = findFullInterServiceRelations(serviceModel);

      expect(result).toEqual([relation]);
    });
  });

  describe("findParentShapeForEmbedded", () => {
    const embedsEmbeddedType = {
      embedded_entities: [createMockEmbeddedEntity("Embedded1", "EmbeddedType")],
    };

    it("should find the parent shape from the embedded shape's parentIds", () => {
      const parentShape = createMockShape(
        "parent-1",
        "core",
        false,
        new Map(),
        createMockServiceModel("ServiceA", embedsEmbeddedType)
      );
      const embeddedShape = createMockShape(
        "embedded-1",
        "embedded",
        false,
        new Map([["ServiceA", ["parent-1"]]]),
        createMockEmbeddedEntity("Embedded1", "EmbeddedType")
      );
      embeddedShape.parentIds.add("parent-1");

      const result = findParentShapeForEmbedded(
        embeddedShape,
        toCanvas(parentShape, embeddedShape)
      );

      expect(result).toBe(parentShape);
    });

    it("should find the parent shape that holds the embedded shape as a child", () => {
      const otherShape = createMockShape(
        "other-1",
        "core",
        false,
        new Map([["OtherType", ["embedded-1"]]]),
        createMockServiceModel("ServiceB")
      );
      const parentShape = createMockShape(
        "parent-1",
        "core",
        false,
        new Map([["EmbeddedType", ["embedded-1"]]]),
        createMockServiceModel("ServiceA", embedsEmbeddedType)
      );
      const embeddedShape = createMockShape(
        "embedded-1",
        "embedded",
        false,
        new Map(),
        createMockEmbeddedEntity("Embedded1", "EmbeddedType")
      );

      const result = findParentShapeForEmbedded(
        embeddedShape,
        toCanvas(otherShape, parentShape, embeddedShape)
      );

      expect(result).toBe(parentShape);
    });

    it("should skip parentIds that are not on the canvas", () => {
      const parentShape = createMockShape(
        "parent-1",
        "core",
        false,
        new Map([["EmbeddedType", ["embedded-1"]]]),
        createMockServiceModel("ServiceA", embedsEmbeddedType)
      );
      const embeddedShape = createMockShape(
        "embedded-1",
        "embedded",
        false,
        new Map(),
        createMockEmbeddedEntity("Embedded1", "EmbeddedType")
      );
      embeddedShape.parentIds.add("removed-parent");

      const result = findParentShapeForEmbedded(
        embeddedShape,
        toCanvas(parentShape, embeddedShape)
      );

      expect(result).toBe(parentShape);
    });

    it("should skip a known parent whose model doesn't embed the entity", () => {
      // A link dragged from an instance the entity relates to also records it as a known parent
      const relatedShape = createMockShape(
        "related-1",
        "core",
        false,
        new Map([["EmbeddedType", ["embedded-1"]]]),
        createMockServiceModel("ServiceB")
      );
      const parentShape = createMockShape(
        "parent-1",
        "core",
        false,
        new Map([["EmbeddedType", ["embedded-1"]]]),
        createMockServiceModel("ServiceA", embedsEmbeddedType)
      );
      const embeddedShape = createMockShape(
        "embedded-1",
        "embedded",
        true,
        new Map(),
        createMockEmbeddedEntity("Embedded1", "EmbeddedType")
      );
      embeddedShape.parentIds.add("related-1");
      embeddedShape.parentIds.add("parent-1");

      const result = findParentShapeForEmbedded(
        embeddedShape,
        toCanvas(relatedShape, parentShape, embeddedShape)
      );

      expect(result).toBe(parentShape);
    });

    it("should return null when no parent is found", () => {
      const embeddedShape = createMockShape(
        "embedded-1",
        "embedded",
        false,
        new Map(),
        createMockEmbeddedEntity("Embedded1", "EmbeddedType")
      );

      const result = findParentShapeForEmbedded(embeddedShape, toCanvas(embeddedShape));

      expect(result).toBeNull();
    });
  });

  describe("getRelationInfo", () => {
    it("should return relation info when found in dictionary", () => {
      const serviceModelA = createMockServiceModel("ServiceA", {
        inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceB", "rw")],
      });
      const sourceShape = createMockShape("source-1", "core", false, new Map(), serviceModelA);
      const targetShape = createMockShape(
        "target-1",
        "core",
        false,
        new Map(),
        createMockServiceModel("ServiceB")
      );

      const relationsDictionary: RelationsDictionary = {
        ServiceA: {
          ServiceB: { lower_limit: 1, upper_limit: 1 },
        },
      };

      const serviceCatalog: ServiceModel[] = [serviceModelA, createMockServiceModel("ServiceB")];

      const result = getRelationInfo(
        sourceShape,
        targetShape,
        relationsDictionary,
        toCanvas(sourceShape, targetShape),
        serviceCatalog
      );

      expect(result).toEqual({
        rules: { lower_limit: 1, upper_limit: 1 },
        modifier: "rw",
      });
    });

    it("should use the embedded entity definition from the parent for an embedded source", () => {
      const embeddedEntity = createMockEmbeddedEntity("Embedded1", "EmbeddedType", {
        inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceB", "rw+")],
      });
      const serviceModelA = createMockServiceModel("ServiceA", {
        embedded_entities: [embeddedEntity],
      });
      const parentShape = createMockShape(
        "parent-1",
        "core",
        false,
        new Map([["EmbeddedType", ["embedded-1"]]]),
        serviceModelA
      );
      const embeddedShape = createMockShape(
        "embedded-1",
        "embedded",
        false,
        new Map([["ServiceA", ["parent-1"]]]),
        embeddedEntity
      );
      embeddedShape.parentIds.add("parent-1");
      const targetShape = createMockShape(
        "target-1",
        "core",
        false,
        new Map(),
        createMockServiceModel("ServiceB")
      );

      const relationsDictionary: RelationsDictionary = {
        EmbeddedType: {
          ServiceB: { lower_limit: 0, upper_limit: 1 },
        },
      };

      const result = getRelationInfo(
        embeddedShape,
        targetShape,
        relationsDictionary,
        toCanvas(parentShape, embeddedShape, targetShape),
        [serviceModelA]
      );

      expect(result).toEqual({
        rules: { lower_limit: 0, upper_limit: 1 },
        modifier: "rw+",
      });
    });

    it("should return null when relation not found", () => {
      const sourceShape = createMockShape(
        "source-1",
        "core",
        false,
        new Map(),
        createMockServiceModel("ServiceA")
      );
      const targetShape = createMockShape(
        "target-1",
        "core",
        false,
        new Map(),
        createMockServiceModel("ServiceB")
      );

      const relationsDictionary: RelationsDictionary = {};

      const result = getRelationInfo(
        sourceShape,
        targetShape,
        relationsDictionary,
        toCanvas(sourceShape, targetShape),
        []
      );

      expect(result).toBeNull();
    });
  });

  describe("canRemoveShape", () => {
    it("should return true for new shapes", () => {
      const shape = createMockShape(
        "shape-1",
        "core",
        true,
        new Map(),
        createMockServiceModel("ServiceA")
      );

      const result = canRemoveShape(shape, toCanvas(shape), {}, []);

      expect(result).toBe(true);
    });

    it("should return false when removing would violate lower_limit", () => {
      const serviceModelB = createMockServiceModel("ServiceB", {
        inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceA", "rw")],
      });
      const sourceShape = createMockShape(
        "source-1",
        "core",
        false,
        new Map([["ServiceB", ["target-1"]]]),
        createMockServiceModel("ServiceA")
      );
      const targetShape = createMockShape(
        "target-1",
        "core",
        false,
        new Map([["ServiceA", ["source-1"]]]),
        serviceModelB
      );

      const relationsDictionary: RelationsDictionary = {
        ServiceB: {
          ServiceA: { lower_limit: 1, upper_limit: 1 },
        },
      };

      const serviceCatalog: ServiceModel[] = [createMockServiceModel("ServiceA"), serviceModelB];

      const result = canRemoveShape(
        sourceShape,
        toCanvas(sourceShape, targetShape),
        relationsDictionary,
        serviceCatalog
      );

      expect(result).toBe(false);
    });

    it("should return true when a connected shape keeps enough connections", () => {
      const serviceModelB = createMockServiceModel("ServiceB", {
        inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceA", "rw+")],
      });
      const sourceShape = createMockShape(
        "source-1",
        "core",
        false,
        new Map([["ServiceB", ["target-1"]]]),
        createMockServiceModel("ServiceA")
      );
      const otherSource = createMockShape(
        "source-2",
        "core",
        false,
        new Map([["ServiceB", ["target-1"]]]),
        createMockServiceModel("ServiceA")
      );
      const targetShape = createMockShape(
        "target-1",
        "core",
        false,
        new Map([["ServiceA", ["source-1", "source-2"]]]),
        serviceModelB
      );

      const relationsDictionary: RelationsDictionary = {
        ServiceB: {
          ServiceA: { lower_limit: 1, upper_limit: null },
        },
      };

      const serviceCatalog: ServiceModel[] = [createMockServiceModel("ServiceA"), serviceModelB];

      const result = canRemoveShape(
        sourceShape,
        toCanvas(sourceShape, otherSource, targetShape),
        relationsDictionary,
        serviceCatalog
      );

      expect(result).toBe(true);
    });

    it("should allow removal even when shape has rw modifier (only other instances' requirements block it)", () => {
      const serviceModelA = createMockServiceModel("ServiceA", {
        inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceB", "rw")],
      });
      const shape = createMockShape(
        "shape-1",
        "core",
        false,
        new Map([["ServiceB", ["target-1"]]]),
        serviceModelA
      );

      const relationsDictionary: RelationsDictionary = {
        ServiceA: {
          ServiceB: { lower_limit: 1, upper_limit: 1 },
        },
      };

      const serviceCatalog: ServiceModel[] = [serviceModelA];

      const result = canRemoveShape(shape, toCanvas(shape), relationsDictionary, serviceCatalog);

      expect(result).toBe(true);
    });

    it("should prevent removing an embedded entity when its parent requires it", () => {
      const embeddedEntity = createMockEmbeddedEntity("Embedded1", "EmbeddedType", {
        lower_limit: 1,
        upper_limit: 1,
        modifier: "rw",
      });

      const serviceModelA = createMockServiceModel("ServiceA", {
        embedded_entities: [embeddedEntity],
      });

      const parentShape = createMockShape(
        "parent-1",
        "core",
        false,
        new Map([["EmbeddedType", ["embedded-1"]]]),
        serviceModelA
      );

      const embeddedShape = createMockShape(
        "embedded-1",
        "embedded",
        false,
        new Map([["ServiceA", ["parent-1"]]]),
        embeddedEntity
      );
      embeddedShape.parentIds.add("parent-1");

      const relationsDictionary: RelationsDictionary = {
        ServiceA: {
          EmbeddedType: { lower_limit: 1, upper_limit: 1 },
        },
        EmbeddedType: {
          ServiceA: { lower_limit: 1, upper_limit: 1 },
        },
      };

      const serviceCatalog: ServiceModel[] = [serviceModelA];

      const result = canRemoveShape(
        embeddedShape,
        toCanvas(parentShape, embeddedShape),
        relationsDictionary,
        serviceCatalog
      );

      expect(result).toBe(false);
    });
  });

  describe("getRemoveActions", () => {
    it("removes a new shape from the canvas, whatever its kind", () => {
      (["core", "embedded", "relation"] as const).forEach((entityType) => {
        const shape = createMockShape(
          "shape-1",
          entityType,
          true,
          new Map(),
          createMockServiceModel("ServiceA")
        );

        expect(getRemoveActions(shape, toCanvas(shape), {}, [])).toEqual({
          canRemoveFromCanvas: true,
          canDelete: false,
        });
      });
    });

    it("removes or deletes an existing service or relation", () => {
      (["core", "relation"] as const).forEach((entityType) => {
        const shape = createMockShape(
          "shape-1",
          entityType,
          false,
          new Map(),
          createMockServiceModel("ServiceA")
        );

        expect(getRemoveActions(shape, toCanvas(shape), {}, [])).toEqual({
          canRemoveFromCanvas: true,
          canDelete: true,
        });
      });
    });

    it("offers neither on a shape staged to be deleted: its menu only undoes the delete", () => {
      const shape = createMockShape(
        "shape-1",
        "core",
        false,
        new Map(),
        createMockServiceModel("ServiceA")
      );

      shape.isMarkedForDeletion = true;

      expect(getRemoveActions(shape, toCanvas(shape), {}, [])).toEqual({
        canRemoveFromCanvas: false,
        canDelete: false,
      });
    });

    it("only deletes the instance the composer edits, never removes it from the canvas", () => {
      const shape = createMockShape(
        "main-1",
        "core",
        false,
        new Map(),
        createMockServiceModel("ServiceA")
      );

      expect(getRemoveActions(shape, toCanvas(shape), {}, [], "main-1")).toEqual({
        canRemoveFromCanvas: false,
        canDelete: true,
      });
    });

    it("can't take an existing embedded entity off on its own", () => {
      const shape = createMockShape(
        "shape-1",
        "embedded",
        false,
        new Map(),
        createMockServiceModel("ServiceA")
      );

      expect(getRemoveActions(shape, toCanvas(shape), {}, [])).toEqual({
        canRemoveFromCanvas: false,
        canDelete: false,
      });
    });

    it("can't take off an existing shape the relations require", () => {
      const serviceModelB = createMockServiceModel("ServiceB", {
        inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceA", "rw+")],
      });
      const sourceShape = createMockShape(
        "source-1",
        "core",
        false,
        new Map([["ServiceB", ["target-1"]]]),
        createMockServiceModel("ServiceA")
      );
      const targetShape = createMockShape(
        "target-1",
        "core",
        false,
        new Map([["ServiceA", ["source-1"]]]),
        serviceModelB
      );
      const relationsDictionary: RelationsDictionary = {
        ServiceB: { ServiceA: { lower_limit: 1, upper_limit: 1 } },
      };

      expect(
        getRemoveActions(sourceShape, toCanvas(sourceShape, targetShape), relationsDictionary, [
          createMockServiceModel("ServiceA"),
          serviceModelB,
        ])
      ).toEqual({ canRemoveFromCanvas: false, canDelete: false });
    });
  });

  describe("canRemoveLink", () => {
    it("should return true when link can be removed", () => {
      // Make source shape new so rw modifier doesn't block removal
      const serviceModelA = createMockServiceModel("ServiceA", {
        inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceB", "rw")],
      });
      const sourceShape = createMockShape(
        "source-1",
        "core",
        true,
        new Map([["ServiceB", ["target-1", "target-2"]]]),
        serviceModelA
      );
      const targetShape = createMockShape(
        "target-1",
        "core",
        false,
        new Map([["ServiceA", ["source-1"]]]),
        createMockServiceModel("ServiceB")
      );

      const relationsDictionary: RelationsDictionary = {
        ServiceA: {
          ServiceB: { lower_limit: 1, upper_limit: 1 },
        },
        ServiceB: {
          ServiceA: { lower_limit: 0, upper_limit: 1 },
        },
      };

      const serviceCatalog: ServiceModel[] = [serviceModelA, createMockServiceModel("ServiceB")];

      const result = canRemoveLink(
        sourceShape,
        targetShape,
        toCanvas(sourceShape, targetShape),
        relationsDictionary,
        serviceCatalog
      );

      expect(result).toBe(true);
    });

    it("should return false when removing would violate lower_limit", () => {
      const serviceModelA = createMockServiceModel("ServiceA", {
        inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceB", "rw")],
      });
      const serviceModelB = createMockServiceModel("ServiceB", {
        inter_service_relations: [createMockInterServiceRelation("rel1", "ServiceA", "rw")],
      });
      const sourceShape = createMockShape(
        "source-1",
        "core",
        false,
        new Map([["ServiceB", ["target-1"]]]),
        serviceModelA
      );
      const targetShape = createMockShape(
        "target-1",
        "core",
        false,
        new Map([["ServiceA", ["source-1"]]]),
        serviceModelB
      );

      const relationsDictionary: RelationsDictionary = {
        ServiceA: {
          ServiceB: { lower_limit: 1, upper_limit: 1 },
        },
        ServiceB: {
          ServiceA: { lower_limit: 1, upper_limit: 1 },
        },
      };

      const serviceCatalog: ServiceModel[] = [serviceModelA, serviceModelB];

      const result = canRemoveLink(
        sourceShape,
        targetShape,
        toCanvas(sourceShape, targetShape),
        relationsDictionary,
        serviceCatalog
      );

      expect(result).toBe(false);
    });
  });

  describe("shapes staged to be deleted", () => {
    const relatedModel = createMockServiceModel("ServiceB");

    /**
     * A new ServiceA that holds two ServiceB instances, b-1 and b-2, with the given limits.
     */
    const setup = (lowerLimit: number, upperLimit: number | null) => {
      const holderModel = createMockServiceModel("ServiceA", {
        inter_service_relations: [createMockInterServiceRelation("b", "ServiceB", "rw+")],
      });
      const holder = createMockShape(
        "a-1",
        "core",
        true,
        new Map([["ServiceB", ["b-1", "b-2"]]]),
        holderModel
      );
      const first = createMockShape("b-1", "relation", false, new Map(), relatedModel);
      const second = createMockShape("b-2", "relation", false, new Map(), relatedModel);
      const relationsDictionary: RelationsDictionary = {
        ServiceA: { ServiceB: { lower_limit: lowerLimit, upper_limit: upperLimit } },
        ServiceB: { ServiceA: { lower_limit: 0, upper_limit: null } },
      };

      return {
        holder,
        first,
        second,
        canvasState: toCanvas(holder, first, second),
        relationsDictionary,
        serviceCatalog: [holderModel, relatedModel],
      };
    };

    it("don't count for the lower limit of the shapes that hold them", () => {
      const { first, second, canvasState, relationsDictionary, serviceCatalog } = setup(1, null);

      expect(canRemoveShape(second, canvasState, relationsDictionary, serviceCatalog)).toBe(true);

      first.isMarkedForDeletion = true;

      expect(canRemoveShape(second, canvasState, relationsDictionary, serviceCatalog)).toBe(false);
      expect(
        getRemoveActions(second, canvasState, relationsDictionary, serviceCatalog).canDelete
      ).toBe(false);
    });

    it("can only be restored while the shapes that hold them have room", () => {
      const { holder, first, second, canvasState, relationsDictionary, serviceCatalog } = setup(
        0,
        1
      );

      // The holder is full with b-2 while b-1 is staged to be deleted
      first.isMarkedForDeletion = true;
      expect(canUndoDelete(first, canvasState, relationsDictionary, serviceCatalog)).toBe(false);

      holder.removeConnection(second.id, "ServiceB");
      expect(canUndoDelete(first, canvasState, relationsDictionary, serviceCatalog)).toBe(true);
    });
  });
});
