import { dia } from "@inmanta/rappid";
import { containerModel, parentModel } from "../Mocks";
import { ServiceEntityBlock } from "../Shapes";
import { defineObjectsForJointJS } from "../testSetup";
import { addDefaultEntities, populateGraphWithDefault } from "./createMode";

beforeAll(() => {
  defineObjectsForJointJS();
});

describe("addDefaultEntities", () => {
  it("return empty array for service without embedded entities to add to the graph ", () => {
    const graph = new dia.Graph({});
    const embedded = addDefaultEntities(graph, parentModel);

    expect(embedded).toMatchObject([]);
  });

  it("adds default entity for service with embedded entities to the graph ", () => {
    const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");
    const graph = new dia.Graph({});

    const embedded = addDefaultEntities(graph, containerModel);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

    //assert the arguments of the first call - calls is array of the arguments of each call
    expect((dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail).toMatchObject({
      name: "child_container",
      id: expect.any(String),
      relations: [{ currentAmount: 0, min: 1, name: "parent-service" }],
    }); //add relations to Tracker

    //assert the arguments of the second call - calls is array of the arguments of each call
    expect((dispatchEventSpy.mock.calls[1][0] as CustomEvent).detail).toMatchObject({
      action: "add",
      name: "child_container",
    }); //update stencil state

    expect(embedded.length).toBe(1);

    expect(embedded[0].getName()).toStrictEqual("child_container");
  });

  it("adds all default entities to the graph for service with embedded entity with lower_limit > 1 ", () => {
    const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");
    const graph = new dia.Graph({});
    const customModel = {
      ...containerModel,
      embedded_entities: [{ ...containerModel.embedded_entities[0], lower_limit: 2 }],
    };

    const embedded = addDefaultEntities(graph, customModel);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(4);
    expect(embedded.length).toBe(2);

    expect(embedded[0].getName()).toStrictEqual("child_container");
    expect(embedded[1].getName()).toStrictEqual("child_container");
  });

  it("adds default entity for service with nested embedded entities to the graph ", () => {
    const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

    const graph = new dia.Graph({});
    const attributes = {
      name: "",
    };

    const createdEntity1 = new ServiceEntityBlock({
      serviceModel: {
        ...containerModel.embedded_entities[0],
        embedded_entities: [{ ...containerModel.embedded_entities[0] }],
      },
      isCore: false,
      isInEditMode: false,
      attributes,
      isEmbeddedEntity: true,
      holderName: "container-service",
    });

    const createdEntity2 = new ServiceEntityBlock({
      serviceModel: containerModel.embedded_entities[0],
      isCore: false,
      isInEditMode: false,
      attributes,
      isEmbeddedEntity: true,
      holderName: "child_container",
    });

    addDefaultEntities(graph, {
      ...containerModel,
      embedded_entities: [
        {
          ...containerModel.embedded_entities[0],
          embedded_entities: containerModel.embedded_entities,
        },
      ],
    });

    expect(dispatchEventSpy).toHaveBeenCalledTimes(6);

    const addedCells = graph
      .getCells()
      .filter((cell) => cell.get("type") !== "Link") as ServiceEntityBlock[];

    //we return only top level embedded entities from addDefaultEntities so to get all we need to check graph directly
    expect(addedCells).toHaveLength(2);

    expect(addedCells[0].get("embeddedTo")).toStrictEqual(createdEntity1.get("embeddedTo"));

    expect(addedCells[0].get("embeddedTo")).toStrictEqual(createdEntity2.get("embeddedTo"));
  });
});

describe("populateGraphWithDefault", () => {
  it("adds default entity for instance without embedded entities to the graph", () => {
    const graph = new dia.Graph({});

    populateGraphWithDefault(graph, parentModel);
    const addedCells = graph.getCells() as ServiceEntityBlock[];

    expect(addedCells).toHaveLength(1);

    expect(addedCells[0].getName()).toStrictEqual(parentModel.name);
  });

  it("adds all required default entities for instance with embedded entities to the graph", () => {
    const graph = new dia.Graph({});

    populateGraphWithDefault(graph, containerModel);
    const addedCells = graph
      .getCells()
      .filter((cell) => cell.get("type") !== "Link") as ServiceEntityBlock[];
    const AddedLinks = graph
      .getCells()
      .filter((cell) => cell.get("type") === "Link") as ServiceEntityBlock[];

    expect(addedCells).toHaveLength(2);
    expect(AddedLinks).toHaveLength(1);

    expect(addedCells[0].getName()).toBe(containerModel.name);
    expect(addedCells[1].getName()).toBe(containerModel.embedded_entities[0].name);
    expect(addedCells[1].get("isEmbeddedEntity")).toBeTruthy();
    expect(addedCells[1].get("holderName")).toBe(containerModel.name);
    expect(addedCells[1].get("embeddedTo")).toBe(addedCells[0].id);
  });
});
