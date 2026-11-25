import { EmbeddedEntity, ServiceModel } from "@inmanta/web-console-core";
import { defineCanvasTestObjects } from "../testSetup";
import { createRelationsDictionary } from "./Helpers/createRelationsDictionary";
import { addConnectionsBetweenShapes } from "./Helpers/linkUtils";
import { ServiceEntityShape } from "./ServiceEntityShape";

const createPort = (name: string, overrides: Partial<EmbeddedEntity> = {}): EmbeddedEntity => ({
  name,
  type: "Port",
  attributes: [
    {
      name: "number",
      type: "string",
      modifier: "rw",
      default_value: null,
      default_value_set: false,
      validation_type: "pydantic.constr",
      validation_parameters: {},
    },
  ],
  embedded_entities: [],
  inter_service_relations: [],
  lower_limit: 0,
  upper_limit: 1,
  modifier: "rw",
  ...overrides,
});

const createService = (embedded: EmbeddedEntity[]): ServiceModel => ({
  name: "Link",
  environment: "test",
  lifecycle: { initial_state: "start", states: [], transfers: [] },
  attributes: [],
  config: {},
  embedded_entities: embedded,
  inter_service_relations: [],
  owned_entities: [],
  owner: null,
});

/**
 * A service with the given ports, its shape, and a card for each of `cards`: the id of the card
 * and the attribute it was created for. The cards are linked in the order given.
 */
const setup = (
  ports: EmbeddedEntity[],
  cards: Array<[id: string, attribute: string]>,
  isNew = true
) => {
  const service = createService(ports);
  const relationsDictionary = createRelationsDictionary([service]);
  const parent = new ServiceEntityShape({
    id: "link",
    entityType: "core",
    serviceModel: service,
    instanceAttributes: {},
    isNew,
    relationsDictionary,
    rootEntities: {},
    interServiceRelations: {},
    embeddedEntities: {},
  });
  const canvasState = new Map<string, ServiceEntityShape>([[parent.id, parent]]);

  cards.forEach(([id, attribute]) => {
    const card = new ServiceEntityShape({
      id,
      entityType: "embedded",
      serviceModel: ports.find((port) => port.name === attribute) ?? ports[0],
      instanceAttributes: { number: id },
      isNew,
      relationsDictionary,
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });

    addConnectionsBetweenShapes(parent, card);
    canvasState.set(id, card);
  });

  return { parent, canvasState };
};

describe("ServiceEntityShape with two embedded attributes of one type", () => {
  beforeAll(() => {
    defineCanvasTestObjects();
  });

  it("orders each card in the attribute it was created for", () => {
    const { parent, canvasState } = setup(
      [createPort("port_a"), createPort("port_b")],
      [
        ["second", "port_b"],
        ["first", "port_a"],
      ]
    );

    expect(parent.getOrderItem(canvasState)?.attributes).toEqual({
      port_a: { number: "first" },
      port_b: { number: "second" },
    });
  });

  it("puts a card whose attribute is full in the first attribute of its type with room", () => {
    const { parent, canvasState } = setup(
      [createPort("port_a"), createPort("port_b"), createPort("port_c")],
      [
        ["first", "port_a"],
        ["second", "port_a"],
      ]
    );

    expect(parent.getOrderItem(canvasState)?.attributes).toEqual({
      port_a: { number: "first" },
      port_b: { number: "second" },
    });

    parent.syncEmbeddedAttributes(canvasState);

    expect(canvasState.get("second")?.serviceModel.name).toBe("port_b");
  });

  it("fills attributes with room for more than one card as lists", () => {
    const { parent, canvasState } = setup(
      [createPort("port_a", { upper_limit: 2 }), createPort("port_b", { upper_limit: null })],
      [
        ["first", "port_a"],
        ["second", "port_a"],
        ["third", "port_a"],
        ["fourth", "port_b"],
      ]
    );

    expect(parent.getOrderItem(canvasState)?.attributes).toEqual({
      port_a: [{ number: "first" }, { number: "second" }],
      port_b: [{ number: "fourth" }, { number: "third" }],
    });
  });

  it("keeps a card no attribute has room for in its own attribute", () => {
    const { parent, canvasState } = setup(
      [createPort("port_a", { upper_limit: 2 }), createPort("port_b")],
      [
        ["first", "port_b"],
        ["second", "port_b"],
        ["third", "port_a"],
        ["fourth", "port_b"],
      ]
    );

    expect(Object.fromEntries(parent.getEmbeddedIdsByAttribute(canvasState))).toEqual({
      port_a: ["third", "second"],
      port_b: ["first", "fourth"],
    });
  });

  it("puts a card from a parent that names its attribute differently in an attribute of this one", () => {
    const ports = createPort("ports", { upper_limit: null });
    const { parent, canvasState } = setup([createPort("port_a"), createPort("port_b")], []);
    const card = new ServiceEntityShape({
      id: "moved",
      entityType: "embedded",
      serviceModel: ports,
      instanceAttributes: { number: "moved" },
      isNew: true,
      relationsDictionary: parent.relationsDictionary,
      rootEntities: {},
      interServiceRelations: {},
      embeddedEntities: {},
    });

    addConnectionsBetweenShapes(parent, card);
    canvasState.set(card.id, card);
    parent.syncEmbeddedAttributes(canvasState);

    expect(card.serviceModel.name).toBe("port_a");
    expect(parent.getOrderItem(canvasState)?.attributes).toEqual({ port_a: { number: "moved" } });
  });

  it("keeps the attributes of a nested embedded entity apart", () => {
    const side = createPort("side", {
      type: "Side",
      attributes: [],
      embedded_entities: [createPort("port_a"), createPort("port_b")],
    });
    const { parent, canvasState } = setup([side], [["side-1", "side"]]);
    const sideCard = canvasState.get("side-1")!;

    [
      ["second", "port_b"],
      ["first", "port_a"],
    ].forEach(([id, attribute]) => {
      const card = new ServiceEntityShape({
        id,
        entityType: "embedded",
        serviceModel: side.embedded_entities.find((port) => port.name === attribute)!,
        instanceAttributes: { number: id },
        isNew: true,
        relationsDictionary: parent.relationsDictionary,
        rootEntities: {},
        interServiceRelations: {},
        embeddedEntities: {},
      });

      addConnectionsBetweenShapes(sideCard, card);
      canvasState.set(id, card);
    });

    expect(parent.getOrderItem(canvasState)?.attributes).toEqual({
      side: { port_a: { number: "first" }, port_b: { number: "second" } },
    });
  });

  it("doesn't put a new card in an attribute an existing instance can't change", () => {
    const ports = [
      createPort("port_a", { modifier: "rw+" }),
      createPort("port_b"),
      createPort("port_c", { modifier: "rw+" }),
    ];
    const { parent, canvasState } = setup(ports, [["first", "port_a"]], false);
    const card = (id: string) =>
      new ServiceEntityShape({
        id,
        entityType: "embedded",
        serviceModel: ports[0],
        instanceAttributes: { number: id },
        isNew: true,
        relationsDictionary: parent.relationsDictionary,
        rootEntities: {},
        interServiceRelations: {},
        embeddedEntities: {},
      });
    const second = card("second");

    expect(parent.validateConnection(second, canvasState)).toBe(true);

    addConnectionsBetweenShapes(parent, second);
    canvasState.set(second.id, second);

    expect(parent.getEmbeddedIdsByAttribute(canvasState).get("port_c")).toEqual(["second"]);
    expect(parent.validateConnection(card("third"), canvasState)).toBe(false);
  });

  it("names the attribute that misses a card", () => {
    const { parent, canvasState } = setup(
      [createPort("port_a", { lower_limit: 1 }), createPort("port_b", { lower_limit: 1 })],
      [["first", "port_a"]]
    );

    expect(parent.getMissingConnections(canvasState)).toEqual([
      { type: "embedded", entityType: "Port", name: "port_b", missing: 1, required: 1 },
    ]);
  });

  it("leaves a read-only attribute of the same type as the instance has it", () => {
    const { parent, canvasState } = setup(
      [createPort("port_r", { modifier: "r" }), createPort("port_a")],
      [["first", "port_a"]],
      false
    );

    parent.updateAttributes({ port_r: { number: "read-only" } });

    expect(parent.getOrderItem(canvasState)?.attributes).toEqual({
      port_r: { number: "read-only" },
      port_a: { number: "first" },
    });
  });
});
