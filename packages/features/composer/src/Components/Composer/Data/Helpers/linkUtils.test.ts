import { ServiceModel } from "@inmanta/web-console-core";
import { defineCanvasTestObjects } from "../../testSetup";
import { ServiceEntityOptions, ServiceEntityShape } from "../ServiceEntityShape";
import { getLinks, addConnectionsBetweenShapes, removeConnectionsBetweenShapes } from "./linkUtils";

describe("linkUtils", () => {
  beforeAll(() => {
    defineCanvasTestObjects();
  });

  const createMockServiceModel = (name: string): ServiceModel => ({
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
  });

  const createShape = (
    id: string,
    entityName: string,
    options: Partial<ServiceEntityOptions> = {}
  ): ServiceEntityShape =>
    new ServiceEntityShape({
      id,
      entityType: "core",
      serviceModel: createMockServiceModel(entityName),
      instanceAttributes: {},
      readonly: false,
      isNew: true,
      lockedOnCanvas: false,
      relationsDictionary: {},
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
      ...options,
    });

  const toCanvas = (...shapes: ServiceEntityShape[]): Map<string, ServiceEntityShape> =>
    new Map(shapes.map((shape) => [shape.id, shape]));

  describe("getLinks", () => {
    it("should return no links for an empty canvas", () => {
      expect(getLinks(new Map())).toEqual([]);
    });

    it("should return no links for shapes without connections", () => {
      const shapeA = createShape("a", "ServiceA");
      const shapeB = createShape("b", "ServiceB");

      expect(getLinks(toCanvas(shapeA, shapeB))).toEqual([]);
    });

    it("should create a single link for a bidirectional connection", () => {
      const shapeA = createShape("a", "ServiceA", { interServiceRelations: { ServiceB: ["b"] } });
      const shapeB = createShape("b", "ServiceB", { interServiceRelations: { ServiceA: ["a"] } });

      const links = getLinks(toCanvas(shapeA, shapeB));

      expect(links).toEqual([{ id: "a->b", source: "a", target: "b" }]);
    });

    it("should point the link from the parent to the child", () => {
      // The child is first on the canvas, but its parentIds name the parent
      const child = createShape("child", "Child", {
        entityType: "embedded",
        rootEntities: { Parent: ["parent"] },
      });
      const parent = createShape("parent", "Parent", { embeddedEntities: { Child: ["child"] } });

      const links = getLinks(toCanvas(child, parent));

      expect(links).toEqual([{ id: "parent->child", source: "parent", target: "child" }]);
    });

    it("should point the link from the shape added first when neither is a parent", () => {
      const shapeB = createShape("b", "ServiceB", { interServiceRelations: { ServiceA: ["a"] } });
      const shapeA = createShape("a", "ServiceA", { interServiceRelations: { ServiceB: ["b"] } });

      const links = getLinks(toCanvas(shapeB, shapeA));

      expect(links).toEqual([{ id: "b->a", source: "b", target: "a" }]);
    });

    it("should follow the parent recorded by addConnectionsBetweenShapes", () => {
      const parent = createShape("parent", "ServiceA");
      const child = createShape("child", "ServiceB");
      addConnectionsBetweenShapes(parent, child);

      const links = getLinks(toCanvas(child, parent));

      expect(links).toEqual([{ id: "parent->child", source: "parent", target: "child" }]);
    });

    it("should skip connections to ids that are not on the canvas", () => {
      const shapeA = createShape("a", "ServiceA", {
        interServiceRelations: { ServiceB: ["b", "missing"] },
      });
      const shapeB = createShape("b", "ServiceB");

      const links = getLinks(toCanvas(shapeA, shapeB));

      expect(links).toEqual([{ id: "a->b", source: "a", target: "b" }]);
    });

    it("should skip a connection of a shape to itself", () => {
      const shapeA = createShape("a", "ServiceA", { interServiceRelations: { ServiceA: ["a"] } });

      expect(getLinks(toCanvas(shapeA))).toEqual([]);
    });

    it("should create one link per connected pair", () => {
      const root = createShape("root", "Root", {
        embeddedEntities: { Child: ["c1", "c2"] },
      });
      const child1 = createShape("c1", "Child", {
        entityType: "embedded",
        rootEntities: { Root: ["root"] },
      });
      const child2 = createShape("c2", "Child", {
        entityType: "embedded",
        rootEntities: { Root: ["root"] },
      });

      const links = getLinks(toCanvas(root, child1, child2));

      expect(links).toEqual([
        { id: "root->c1", source: "root", target: "c1" },
        { id: "root->c2", source: "root", target: "c2" },
      ]);
    });
  });

  describe("addConnectionsBetweenShapes", () => {
    it("should add connections to both shapes, keyed by the other shape's entity type", () => {
      const sourceShape = createShape("source-1", "ServiceA");
      const targetShape = createShape("target-1", "ServiceB");

      addConnectionsBetweenShapes(sourceShape, targetShape);

      // Source connects to target using target's entity type
      expect(sourceShape.connections.get("ServiceB")).toEqual(["target-1"]);
      // Target connects to source using source's entity type
      expect(targetShape.connections.get("ServiceA")).toEqual(["source-1"]);
    });

    it("should not duplicate an existing connection", () => {
      const sourceShape = createShape("source-1", "ServiceA");
      const targetShape = createShape("target-1", "ServiceB");

      addConnectionsBetweenShapes(sourceShape, targetShape);
      addConnectionsBetweenShapes(sourceShape, targetShape);

      expect(sourceShape.connections.get("ServiceB")).toEqual(["target-1"]);
      expect(targetShape.connections.get("ServiceA")).toEqual(["source-1"]);
    });

    it("should register source as a known parent of target in parentIds", () => {
      const sourceShape = createShape("source-1", "ServiceA");
      const targetShape = createShape("target-1", "ServiceB");

      addConnectionsBetweenShapes(sourceShape, targetShape);

      expect(targetShape.parentIds.has("source-1")).toBe(true);
      expect(sourceShape.parentIds.has("target-1")).toBe(false);
    });
  });

  describe("removeConnectionsBetweenShapes", () => {
    it("should remove connections from both shapes", () => {
      const sourceShape = createShape("source-1", "ServiceA");
      const targetShape = createShape("target-1", "ServiceB");
      addConnectionsBetweenShapes(sourceShape, targetShape);

      removeConnectionsBetweenShapes(sourceShape, targetShape);

      expect(sourceShape.connections.has("ServiceB")).toBe(false);
      expect(targetShape.connections.has("ServiceA")).toBe(false);
    });

    it("should only remove the connection to the given shape", () => {
      const sourceShape = createShape("source-1", "ServiceA");
      const targetShape = createShape("target-1", "ServiceB");
      const otherTarget = createShape("target-2", "ServiceB");
      addConnectionsBetweenShapes(sourceShape, targetShape);
      addConnectionsBetweenShapes(sourceShape, otherTarget);

      removeConnectionsBetweenShapes(sourceShape, targetShape);

      expect(sourceShape.connections.get("ServiceB")).toEqual(["target-2"]);
      expect(otherTarget.connections.get("ServiceA")).toEqual(["source-1"]);
    });

    it("should remove source from target's parentIds", () => {
      const sourceShape = createShape("source-1", "ServiceA");
      const targetShape = createShape("target-1", "ServiceB");
      targetShape.parentIds.add("source-1");

      removeConnectionsBetweenShapes(sourceShape, targetShape);

      expect(targetShape.parentIds.has("source-1")).toBe(false);
    });
  });
});
