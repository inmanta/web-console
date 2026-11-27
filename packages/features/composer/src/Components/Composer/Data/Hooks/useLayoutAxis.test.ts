import { renderHook } from "@testing-library/react";
import { ServiceModel } from "@inmanta/web-console-core";
import { defineCanvasTestObjects } from "../../testSetup";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { useLayoutAxis } from "./useLayoutAxis";

const createModel = (name: string): ServiceModel => ({
  name,
  environment: "test",
  lifecycle: { initial_state: "active", states: [], transfers: [] },
  attributes: [],
  config: {},
  embedded_entities: [],
  inter_service_relations: [],
  owned_entities: [],
  owner: null,
});

const createCard = (id: string, x: number, y: number): ServiceEntityShape => {
  const shape = new ServiceEntityShape({
    id,
    entityType: "core",
    serviceModel: createModel(id),
    instanceAttributes: {},
    isNew: true,
    relationsDictionary: {},
    rootEntities: {},
    interServiceRelations: {},
    embeddedEntities: {},
  });

  shape.setPosition(x, y);
  shape.size = { width: 280, height: 50 };

  return shape;
};

/**
 * A parent with two children in the next layer, left to right, each apart from it on both
 * axes, so no connection says which way the canvas is laid out and it reads left to right.
 */
const setup = () => {
  const parent = createCard("parent", 0, 0);
  const above = createCard("above", 400, -70);
  const below = createCard("below", 400, 70);

  parent.addConnection(above.id, "above");
  parent.addConnection(below.id, "below");

  const toCanvas = () =>
    new Map([parent, above, below].map((shape): [string, ServiceEntityShape] => [shape.id, shape]));
  const hook = renderHook(({ canvasState }) => useLayoutAxis(canvasState), {
    initialProps: { canvasState: toCanvas() },
  });

  return { parent, below, toCanvas, hook };
};

describe("useLayoutAxis", () => {
  beforeAll(() => {
    defineCanvasTestObjects();
  });

  it("keeps the axis when a card is dragged, also once the canvas changes otherwise", () => {
    const { below, toCanvas, hook } = setup();

    expect(hook.result.current.layoutAxis).toBe("horizontal");

    // Dragged right below the parent: read again, this link would say top to bottom
    below.setPosition(0, 200);
    hook.result.current.onCardDragged(below.id, { x: 0, y: 200 });
    // An attribute edit replaces the canvas state
    hook.rerender({ canvasState: toCanvas() });

    expect(hook.result.current.layoutAxis).toBe("horizontal");
  });

  it("reads the axis again when cards are placed without a drag", () => {
    const { below, toCanvas, hook } = setup();

    // An Arrange or an undo moves the card, then replaces the canvas state
    below.setPosition(0, 200);
    hook.rerender({ canvasState: toCanvas() });

    expect(hook.result.current.layoutAxis).toBe("vertical");
  });

  it("reads the axis again when a link is added", () => {
    const { parent, below, toCanvas, hook } = setup();

    below.setPosition(0, 200);
    hook.result.current.onCardDragged(below.id, { x: 0, y: 200 });
    hook.rerender({ canvasState: toCanvas() });

    expect(hook.result.current.layoutAxis).toBe("horizontal");

    const added = createCard("added", 0, -200);

    parent.addConnection(added.id, "added");
    hook.rerender({ canvasState: new Map([...toCanvas(), [added.id, added]]) });

    expect(hook.result.current.layoutAxis).toBe("vertical");
  });
});
