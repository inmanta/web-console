import { ServiceModel } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { getArrangeScope } from "./arrangeScope";
import { addConnectionsBetweenShapes } from "./linkUtils";

describe("getArrangeScope", () => {
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

  const toCanvas = (...shapes: ServiceEntityShape[]): Map<string, ServiceEntityShape> =>
    new Map(shapes.map((shape) => [shape.id, shape]));

  it("can't arrange an empty canvas", () => {
    expect(getArrangeScope(new Map(), null)).toEqual({
      canArrangeAll: false,
      canArrangeBelow: false,
      rootId: undefined,
    });
  });

  it("can't arrange a single entity", () => {
    const shape = createShape("only");

    expect(getArrangeScope(toCanvas(shape), shape)).toEqual({
      canArrangeAll: false,
      canArrangeBelow: false,
      rootId: undefined,
    });
  });

  it("doesn't count entities hidden in collapsed layers", () => {
    const parent = createShape("parent");
    const child = createShape("child");
    addConnectionsBetweenShapes(parent, child);
    child.isHidden = true;

    expect(getArrangeScope(toCanvas(parent, child), parent)).toEqual({
      canArrangeAll: false,
      canArrangeBelow: false,
      rootId: undefined,
    });
  });

  it("arranges the whole canvas when nothing is selected", () => {
    const parent = createShape("parent");
    const child = createShape("child");
    addConnectionsBetweenShapes(parent, child);

    expect(getArrangeScope(toCanvas(parent, child), null)).toEqual({
      canArrangeAll: true,
      canArrangeBelow: false,
      rootId: undefined,
    });
  });

  it("arranges below the selected entity when something is below it", () => {
    const parent = createShape("parent");
    const child = createShape("child");
    addConnectionsBetweenShapes(parent, child);

    expect(getArrangeScope(toCanvas(parent, child), parent)).toEqual({
      canArrangeAll: true,
      canArrangeBelow: true,
      rootId: "parent",
    });
  });

  it("arranges the whole canvas when the selected entity has nothing below it", () => {
    const parent = createShape("parent");
    const child = createShape("child");
    addConnectionsBetweenShapes(parent, child);

    expect(getArrangeScope(toCanvas(parent, child), child)).toEqual({
      canArrangeAll: true,
      canArrangeBelow: false,
      rootId: undefined,
    });
  });
});
