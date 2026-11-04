import { ServiceModel } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { applyLayeredLayout } from "./canvasLayoutUtils";
import { addConnectionsBetweenShapes } from "./linkUtils";

describe("applyLayeredLayout", () => {
  const createShape = (id: string, x = 0, y = 0): ServiceEntityShape => {
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
    }).position(x, y);
  };

  const toCanvas = (...shapes: ServiceEntityShape[]): Map<string, ServiceEntityShape> =>
    new Map(shapes.map((shape) => [shape.id, shape]));

  it("should do nothing on an empty canvas", () => {
    expect(applyLayeredLayout(new Map())).toEqual([]);
  });

  it("should put a child to the right of its parent in an LR layout", () => {
    const parent = createShape("parent");
    const child = createShape("child");
    addConnectionsBetweenShapes(parent, child);

    applyLayeredLayout(toCanvas(child, parent), "LR");

    expect(child.position().x).toBeGreaterThanOrEqual(parent.position().x + parent.size.width);
  });

  it("should put a child below its parent in a TB layout", () => {
    const parent = createShape("parent");
    const child = createShape("child");
    addConnectionsBetweenShapes(parent, child);

    applyLayeredLayout(toCanvas(child, parent), "TB");

    expect(child.position().y).toBeGreaterThanOrEqual(parent.position().y + parent.size.height);
  });

  it("should not overlap siblings in the same layer", () => {
    const parent = createShape("parent");
    const childA = createShape("a");
    const childB = createShape("b");
    addConnectionsBetweenShapes(parent, childA);
    addConnectionsBetweenShapes(parent, childB);

    applyLayeredLayout(toCanvas(parent, childA, childB), "LR");

    // Same layer: same column, stacked without overlapping
    expect(childA.position().x).toBe(childB.position().x);
    const [upper, lower] = [childA, childB].sort((s1, s2) => s1.position().y - s2.position().y);
    expect(lower.position().y).toBeGreaterThanOrEqual(upper.position().y + upper.size.height);
  });

  it("should keep the top-left corner of the arranged shapes in place", () => {
    const parent = createShape("parent", 500, 300);
    const child = createShape("child", 200, 400);
    addConnectionsBetweenShapes(parent, child);

    const moved = applyLayeredLayout(toCanvas(parent, child));

    expect(moved.sort()).toEqual(["child", "parent"]);
    const positions = [parent.position(), child.position()];
    expect(Math.min(...positions.map(({ x }) => x))).toBe(200);
    expect(Math.min(...positions.map(({ y }) => y))).toBe(300);
  });

  it("should keep the root in place and only move its subtree when given a rootId", () => {
    const top = createShape("top", 0, 0);
    const root = createShape("root", 1000, 500);
    const child = createShape("child", 0, 900);
    const unrelated = createShape("unrelated", 50, 50);
    addConnectionsBetweenShapes(top, root);
    addConnectionsBetweenShapes(root, child);

    const moved = applyLayeredLayout(toCanvas(top, root, child, unrelated), "LR", "root");

    expect(moved.sort()).toEqual(["child", "root"]);
    expect(root.position()).toEqual({ x: 1000, y: 500 });
    expect(child.position().x).toBeGreaterThanOrEqual(1000 + root.size.width);
    // The parent of the root and unrelated shapes are outside the subtree
    expect(top.position()).toEqual({ x: 0, y: 0 });
    expect(unrelated.position()).toEqual({ x: 50, y: 50 });
  });

  it("should not move hidden shapes", () => {
    const parent = createShape("parent", 100, 100);
    const child = createShape("child", 100, 100);
    const hidden = createShape("hidden", 7, 9);
    addConnectionsBetweenShapes(parent, child);
    addConnectionsBetweenShapes(child, hidden);
    hidden.isHidden = true;

    const moved = applyLayeredLayout(toCanvas(parent, child, hidden));

    expect(moved).not.toContain("hidden");
    expect(hidden.position()).toEqual({ x: 7, y: 9 });
  });

  it("should return no ids when every shape is hidden", () => {
    const shape = createShape("shape", 10, 20);
    shape.isHidden = true;

    expect(applyLayeredLayout(toCanvas(shape))).toEqual([]);
    expect(shape.position()).toEqual({ x: 10, y: 20 });
  });
});
