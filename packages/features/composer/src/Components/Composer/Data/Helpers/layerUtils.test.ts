import { ServiceModel } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../ServiceEntityShape";
import {
  collapseLayers,
  countHiddenLayers,
  expandAllLayers,
  expandLayers,
  getConnectedLayerData,
  getDirectLayerData,
  revealDirectChildren,
} from "./layerUtils";
import { addConnectionsBetweenShapes } from "./linkUtils";

describe("layerUtils", () => {
  const createShape = (id: string): ServiceEntityShape => {
    const serviceModel: ServiceModel = {
      name: `Service-${id}`,
      environment: "test",
      lifecycle: { initial_state: "active", states: [], transfers: [] },
      attributes: [],
      config: {},
      embedded_entities: [],
      inter_service_relations: [],
      owned_entities: [],
      owner: null,
    };

    return new ServiceEntityShape({
      id,
      entityType: "core",
      serviceModel,
      instanceAttributes: {},
      readonly: false,
      isNew: true,
      lockedOnCanvas: false,
      relationsDictionary: {},
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });
  };

  /**
   * Builds the tree:
   *
   *   top -> root -> a -> a1
   *               -> b
   *
   * `top` is the parent of `root`, so traversal from `root` must not go up to it.
   */
  const setup = () => {
    const [top, root, a, a1, b] = ["top", "root", "a", "a1", "b"].map(createShape);

    addConnectionsBetweenShapes(top, root);
    addConnectionsBetweenShapes(root, a);
    addConnectionsBetweenShapes(a, a1);
    addConnectionsBetweenShapes(root, b);

    const canvasState = new Map([top, root, a, a1, b].map((shape) => [shape.id, shape]));

    return { canvasState, top, root, a, a1, b };
  };

  const ids = (shapes: ServiceEntityShape[]) => shapes.map((shape) => shape.id).sort();

  describe("getDirectLayerData", () => {
    it("should return only the direct children, not the parents or grandchildren", () => {
      const { canvasState, root } = setup();

      expect(ids(getDirectLayerData(canvasState, root).shapes)).toEqual(["a", "b"]);
    });

    it("should skip connections to shapes that are not on the canvas", () => {
      const { canvasState, root } = setup();
      canvasState.delete("b");

      expect(ids(getDirectLayerData(canvasState, root).shapes)).toEqual(["a"]);
    });

    it("should return no shapes for a leaf", () => {
      const { canvasState, a1 } = setup();

      expect(getDirectLayerData(canvasState, a1).shapes).toEqual([]);
    });
  });

  describe("getConnectedLayerData", () => {
    it("should return every shape below the shape, without going up", () => {
      const { canvasState, root } = setup();

      expect(ids(getConnectedLayerData(canvasState, root).shapes)).toEqual(["a", "a1", "b"]);
    });

    it("should not include the shape itself", () => {
      const { canvasState, top } = setup();

      expect(ids(getConnectedLayerData(canvasState, top).shapes)).toEqual(["a", "a1", "b", "root"]);
    });

    it("should follow connections without known parents", () => {
      const x = createShape("x");
      const y = createShape("y");
      x.addConnection("y", y.getEntityType());
      y.addConnection("x", x.getEntityType());
      const canvasState = new Map([
        ["x", x],
        ["y", y],
      ]);

      expect(ids(getConnectedLayerData(canvasState, x).shapes)).toEqual(["y"]);
    });
  });

  describe("collapseLayers", () => {
    it("should hide every layer below the shape and mark them collapsed", () => {
      const { canvasState, top, root, a, a1, b } = setup();

      collapseLayers(canvasState, root);

      expect(root.isLayersCollapsed).toBe(true);
      expect(root.isHidden).toBe(false);
      [a, a1, b].forEach((child) => {
        expect(child.isHidden).toBe(true);
        expect(child.isLayersCollapsed).toBe(true);
      });
      expect(top.isHidden).toBe(false);
      expect(top.isLayersCollapsed).toBe(false);
    });
  });

  describe("expandLayers", () => {
    it("should show only the first layer below the shape", () => {
      const { canvasState, root, a, a1, b } = setup();
      collapseLayers(canvasState, root);

      expandLayers(canvasState, root);

      expect(root.isLayersCollapsed).toBe(false);
      expect(a.isHidden).toBe(false);
      expect(b.isHidden).toBe(false);
      // Deeper layers stay collapsed, and their parent offers to expand them
      expect(a.isLayersCollapsed).toBe(true);
      expect(a1.isHidden).toBe(true);
    });
  });

  describe("expandAllLayers", () => {
    it("should show every layer below the shape", () => {
      const { canvasState, root, a, a1, b } = setup();
      collapseLayers(canvasState, root);

      expandAllLayers(canvasState, root);

      [root, a, a1, b].forEach((shape) => {
        expect(shape.isHidden).toBe(false);
        expect(shape.isLayersCollapsed).toBe(false);
      });
    });
  });

  describe("revealDirectChildren", () => {
    it("should show the direct children of a collapsed shape", () => {
      const { canvasState, root, a, a1, b } = setup();
      collapseLayers(canvasState, root);

      revealDirectChildren(canvasState, root);

      expect(a.isHidden).toBe(false);
      expect(b.isHidden).toBe(false);
      expect(a1.isHidden).toBe(true);
    });

    it("should leave the layers alone when the shape is not collapsed", () => {
      const { canvasState, root, a } = setup();
      a.isHidden = true;

      revealDirectChildren(canvasState, root);

      expect(a.isHidden).toBe(true);
      expect(root.isLayersCollapsed).toBe(false);
    });
  });

  describe("countHiddenLayers", () => {
    it("should return 0 when the shape is not collapsed", () => {
      const { canvasState, root } = setup();

      expect(countHiddenLayers(canvasState, root)).toBe(0);
    });

    it("should count the hidden shapes below a collapsed shape", () => {
      const { canvasState, root } = setup();
      collapseLayers(canvasState, root);

      expect(countHiddenLayers(canvasState, root)).toBe(3);
    });

    it("should only count shapes that are still hidden", () => {
      const { canvasState, root, b } = setup();
      collapseLayers(canvasState, root);
      b.isHidden = false;

      expect(countHiddenLayers(canvasState, root)).toBe(2);
    });

    it("should keep a nested collapse when the outer layer is expanded", () => {
      const { canvasState, top, root } = setup();
      collapseLayers(canvasState, root);
      collapseLayers(canvasState, top);
      expandLayers(canvasState, top);

      // top shows root again; root's own layers (a, a1, b) are still hidden
      expect(top.isLayersCollapsed).toBe(false);
      expect(root.isHidden).toBe(false);
      expect(countHiddenLayers(canvasState, root)).toBe(3);
    });
  });
});
