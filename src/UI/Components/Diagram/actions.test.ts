import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/GETTERS/GetInstanceWithRelations";
import {
  childModel,
  containerModel,
  mockedInstanceWithRelations,
  parentModel,
} from "./Mocks/Mock";
import services from "./Mocks/services.json";
import {
  addDefaultEntities,
  appendEmbeddedEntity,
  appendInstance,
  createComposerEntity,
  addInfoIcon,
  populateGraphWithDefault,
  updateAttributes,
} from "./actions";
import { ComposerPaper } from "./paper";
import { ServiceEntityBlock } from "./shapes";
import { defineObjectsForJointJS } from "./testSetup";

beforeAll(() => {
  defineObjectsForJointJS();
});

describe("createComposerEntity", () => {
  it("creates a new core entity", () => {
    const isCore = true;
    const isInEditMode = false;
    const coreEntity = createComposerEntity(parentModel, isCore, isInEditMode);

    expect(coreEntity.get("holderName")).toBe(undefined);
    expect(coreEntity.get("isEmbedded")).toBe(undefined);
    expect(coreEntity.get("isCore")).toBe(true);
    expect(coreEntity.get("isInEditMode")).toBe(false);
  });

  it("creates a new embedded entity", () => {
    const isCore = false;
    const isEmbedded = true;
    const isInEditMode = false;
    const attributes = undefined;

    const embeddedEntity = createComposerEntity(
      containerModel.embedded_entities[0],
      isCore,
      isInEditMode,
      attributes,
      isEmbedded,
      containerModel.name,
    );

    expect(embeddedEntity.get("holderName")).toBe(containerModel.name);
    expect(embeddedEntity.get("isEmbedded")).toBe(true);
    expect(embeddedEntity.get("isCore")).toBe(undefined);
    expect(embeddedEntity.get("isInEditMode")).toBe(false);
  });
  it("creates a new entity with inster-service relations", () => {
    const isCore = false;
    const isInEditMode = false;

    const childEntity = createComposerEntity(childModel, isCore, isInEditMode);

    expect(childEntity.get("holderName")).toBe(undefined);
    expect(childEntity.get("isEmbedded")).toBe(undefined);
    expect(childEntity.get("isCore")).toBe(undefined);
    expect(childEntity.get("isInEditMode")).toBe(false);
    expect(childEntity.get("relatedTo")).toMatchObject(new Map());
  });
});

describe("updateAttributes", () => {
  it("set attributes, sanitizedAttrs and displayed items on initial update", () => {
    const instanceAsTable = new ServiceEntityBlock().setName(parentModel.name);
    const attributes = mockedInstanceWithRelations.instance
      .active_attributes as InstanceAttributeModel; // instance based on parent-service model
    const isInitial = true;

    updateAttributes(
      instanceAsTable,
      ["name", "service_id"],
      attributes,
      isInitial,
    );

    expect(instanceAsTable.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("instanceAttributes")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    // expect(instanceAsTable.get("dataToDisplay")).toMatchObject({}); //if length of attributes is more than 4 then we will have dataToDisplay attribute
    expect(instanceAsTable.get("items")).toMatchObject([
      [
        {
          id: "name",
          label: "name",
          span: 2,
        },
        {
          id: "service_id",
          label: "service_id",
          span: 2,
        },
      ],
      [
        {
          id: "name_value",
          label: "test12345",
        },
        {
          id: "service_id_value",
          label: "123412",
        },
      ],
    ]);
  });

  it("when there is no key attributes only attributes and sanitizedAttrs are set", () => {
    const instanceAsTable = new ServiceEntityBlock().setName(parentModel.name);
    const attributes = mockedInstanceWithRelations.instance
      .active_attributes as InstanceAttributeModel; // instance based on parent-service model
    const isInitial = true;

    updateAttributes(instanceAsTable, [], attributes, isInitial);

    expect(instanceAsTable.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("instanceAttributes")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    // expect(instanceAsTable.get("dataToDisplay")).toMatchObject({}); //if length of attributes is more than 4 then we will have dataToDisplay attribute
    expect(instanceAsTable.get("items")).toMatchObject([[], []]);
  });

  it("sanitized Attributes won't be overridden if isInitial property is set to false or if there are sanitizedAttributes already set", () => {
    //sanitizedAttrs property is updated from the sidebar level as it requires fields to be present
    const instanceAsTable = new ServiceEntityBlock().setName(parentModel.name);
    const attributes = mockedInstanceWithRelations.instance
      .active_attributes as InstanceAttributeModel; // instance based on parent-service model
    const isInitial = true;

    updateAttributes(instanceAsTable, [], attributes, isInitial);

    expect(instanceAsTable.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("instanceAttributes")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("items")).toMatchObject([[], []]);

    const updatedIsInitial = false;
    const updatedAttributes = {
      name: "newName",
      service_id: "newId",
      should_deploy_fail: false,
    };

    updateAttributes(instanceAsTable, [], updatedAttributes, updatedIsInitial);

    expect(instanceAsTable.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("instanceAttributes")).toMatchObject({
      name: "newName",
      service_id: "newId",
      should_deploy_fail: false,
    });

    const updatedIsInitial2 = true;

    updateAttributes(instanceAsTable, [], updatedAttributes, updatedIsInitial2);

    expect(instanceAsTable.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("instanceAttributes")).toMatchObject({
      name: "newName",
      service_id: "newId",
      should_deploy_fail: false,
    });
  });
});

describe("addDefaultEntities", () => {
  it("return empty array for service without embedded entities to add to the graph ", () => {
    const graph = new dia.Graph({});
    const embedded = addDefaultEntities(graph, parentModel);

    expect(embedded).toMatchObject([]);
  });

  it("adds default entity for service with embedded entities to the graph ", () => {
    const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");
    const graph = new dia.Graph({});

    const embedded = addDefaultEntities(graph, containerModel);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    expect(
      (dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail,
    ).toMatchObject({
      action: "add",
      name: "child_container",
    });
    expect(embedded.length).toBe(1);

    expect(embedded[0].getName()).toStrictEqual("child_container");
  });

  it("adds default entity for service with nested embedded entities to the graph ", () => {
    const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

    const graph = new dia.Graph({});
    const attributes = {
      name: "",
    };
    const isCore = false;
    const isInEditMode = false;
    const isEmbedded = true;

    const createdEntity1 = createComposerEntity(
      {
        ...containerModel.embedded_entities[0],
        embedded_entities: [{ ...containerModel.embedded_entities[0] }],
      },
      isCore,
      isInEditMode,
      attributes,
      isEmbedded,
      "container-service",
    );
    const createdEntity2 = createComposerEntity(
      containerModel.embedded_entities[0],
      isCore,
      isInEditMode,
      attributes,
      isEmbedded,
      "child_container",
    );

    addDefaultEntities(graph, {
      ...containerModel,
      embedded_entities: [
        {
          ...containerModel.embedded_entities[0],
          embedded_entities: containerModel.embedded_entities,
        },
      ],
    });

    expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

    expect(
      (dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail,
    ).toMatchObject({
      action: "add",
      name: "child_container",
    });
    expect(
      (dispatchEventSpy.mock.calls[1][0] as CustomEvent).detail,
    ).toMatchObject({
      action: "add",
      name: "child_container",
    });

    const addedCells = graph
      .getCells()
      .filter((cell) => cell.get("type") !== "Link") as ServiceEntityBlock[];

    //we return only top level embedded entities from addDefaultEntities so to get all we need to check graph directly
    expect(addedCells).toHaveLength(2);

    expect(addedCells[0].get("embeddedTo")).toStrictEqual(
      createdEntity1.get("embeddedTo"),
    );

    expect(addedCells[0].get("embeddedTo")).toStrictEqual(
      createdEntity2.get("embeddedTo"),
    );

    //assert that  other cells were added to graph
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
    expect(addedCells[1].getName()).toBe(
      containerModel.embedded_entities[0].name,
    );
    expect(addedCells[1].get("isEmbedded")).toBeTruthy();
    expect(addedCells[1].get("holderName")).toBe(containerModel.name);
    expect(addedCells[1].get("embeddedTo")).toBe(addedCells[0].id);
  });
});

describe("addInfoIcon", () => {
  it('sets "info" attribute with active icon and active tooltip if presentedAttrs are set to active', () => {
    const addedEntity = new ServiceEntityBlock();

    expect(addedEntity.get("attrs")).toBeDefined();
    expect(addedEntity.get("attrs")?.info).toBeUndefined();

    addInfoIcon(addedEntity, "active");
    expect(addedEntity.get("attrs")).toBeDefined();
    expect(addedEntity.get("attrs")?.info).toMatchObject({
      preserveAspectRatio: "none",
      cursor: "pointer",
      x: "calc(0.85*w)",
      "xlink:href": expect.any(String),
      "data-tooltip": "Active Attributes",
      y: 8,
      width: 14,
      height: 14,
    });
  });

  it('sets "info" attribute with candidate icon and candidate tooltip if presentedAttrs are set to candidate', () => {
    const addedEntity = new ServiceEntityBlock();

    expect(addedEntity.get("attrs")).toBeDefined();
    expect(addedEntity.get("attrs")?.info).toBeUndefined();

    addInfoIcon(addedEntity, "candidate");

    expect(addedEntity.get("attrs")).toBeDefined();
    expect(addedEntity.get("attrs")?.info).toMatchObject({
      preserveAspectRatio: "none",
      cursor: "pointer",
      x: "calc(0.85*w)",
      "xlink:href": expect.any(String),
      "data-tooltip": "Candidate Attributes",
      y: 6,
      width: 15,
      height: 15,
    });
  });
});

describe("appendEmbeddedEntity", () => {
  const setup = () => {
    const graph = new dia.Graph({});
    const paper = new ComposerPaper({}, graph, true).paper;
    const embeddedModel = containerModel.embedded_entities[0];

    return { graph, paper, embeddedModel };
  };

  interface EachProps {
    embeddedEntity: EmbeddedEntity;
    entityAttributes: InstanceAttributeModel;
    embeddedTo: string | dia.Cell.ID;
    holderName: string;
    presentedAttrs: "candidate" | "active";
    isBlockedFromEditing: boolean;
    expectedMap: Map<string, string>;
    expectedCalls: number;
  }

  it.each`
    entityAttributes                               | embeddedTo | holderName             | isBlockedFromEditing | expectedMap
    ${{ name: "child123" }}                        | ${"123"}   | ${"container-service"} | ${undefined}         | ${new Map([])}
    ${{ name: "child123", parent_entity: "1234" }} | ${"123"}   | ${"container-service"} | ${undefined}         | ${new Map().set("1234", "parent_entity")}
    ${{ name: "child123" }}                        | ${"123"}   | ${"container-service"} | ${true}              | ${new Map([])}
    ${{ name: "child123" }}                        | ${"123"}   | ${"container-service"} | ${false}             | ${new Map([])}
    ${{ name: "child123" }}                        | ${"123"}   | ${"container-service"} | ${false}             | ${new Map([])}
    ${{ name: "child123" }}                        | ${"123"}   | ${"container-service"} | ${false}             | ${new Map([])}
  `(
    "append embedded entity to the graph",
    ({
      entityAttributes,
      embeddedTo,
      holderName,
      isBlockedFromEditing,
      expectedMap,
    }: EachProps) => {
      const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

      const { graph, paper, embeddedModel } = setup();
      const presentedAttrs = undefined;

      appendEmbeddedEntity(
        paper,
        graph,
        embeddedModel,
        entityAttributes,
        embeddedTo,
        holderName,
        presentedAttrs,
        isBlockedFromEditing,
      );

      const cells = graph.getCells();

      expect(cells).toHaveLength(1);
      expect(cells[0].get("entityName")).toBe("child_container");
      expect(cells[0].get("holderName")).toBe("container-service");
      expect(cells[0].get("isEmbedded")).toBe(true);
      expect(cells[0].get("embeddedTo")).toBe("123");

      //we assign to this property attributes without inter-service relations
      expect(cells[0].get("instanceAttributes")).toMatchObject({
        name: entityAttributes.name,
      });

      expect(cells[0].get("isBlockedFromEditing")).toBe(isBlockedFromEditing);
      expect(cells[0].get("cantBeRemoved")).toBe(true);
      expect(cells[0].get("relatedTo")).toMatchObject(expectedMap);
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      expect(
        (dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail,
      ).toMatchObject({
        action: "add",
        name: "child_container",
      });
    },
  );

  it("append embedded entities to the graph and paper", () => {
    const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

    const { graph, paper, embeddedModel } = setup();
    const presentedAttrs = undefined;
    const entityAttributes = [
      { name: "child123", parent_entity: "1234" },
      { name: "child1233", parent_entity: "12346" },
    ];
    const embeddedTo = "123";
    const holderName = "container-service";
    const isBlockedFromEditing = undefined;
    const expectedMap = new Map().set("1234", "parent_entity");
    const expectedMap2 = new Map().set("12346", "parent_entity");

    appendEmbeddedEntity(
      paper,
      graph,
      embeddedModel,
      entityAttributes,
      embeddedTo,
      holderName,
      presentedAttrs,
      isBlockedFromEditing,
    );

    const cells = graph.getCells();

    expect(cells).toHaveLength(2);
    expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

    //assert first cell
    expect(cells[0].get("entityName")).toBe("child_container");
    expect(cells[0].get("isEmbedded")).toBe(true);
    expect(cells[0].get("embeddedTo")).toBe("123");

    //we assign to this property attributes without inter-service relations
    expect(cells[0].get("instanceAttributes")).toMatchObject({
      name: entityAttributes[0].name,
    });

    expect(cells[0].get("isBlockedFromEditing")).toBe(isBlockedFromEditing);
    expect(cells[0].get("cantBeRemoved")).toBe(true);
    expect(cells[0].get("relatedTo")).toMatchObject(expectedMap);

    //assert second cell
    expect(cells[1].get("entityName")).toBe("child_container");
    expect(cells[1].get("isEmbedded")).toBe(true);
    expect(cells[1].get("embeddedTo")).toBe("123");

    //we assign to this property attributes without inter-service relations
    expect(cells[1].get("instanceAttributes")).toMatchObject({
      name: entityAttributes[1].name,
    });

    expect(cells[1].get("isBlockedFromEditing")).toBe(isBlockedFromEditing);
    expect(cells[1].get("cantBeRemoved")).toBe(true);
    expect(cells[1].get("relatedTo")).toMatchObject(expectedMap2);
  });

  const infoAssertion = (y, width, height, tooltip) => ({
    preserveAspectRatio: "none",
    cursor: "pointer",
    x: "calc(0.85*w)",
    "xlink:href": expect.any(String),
    "data-tooltip": tooltip,
    y,
    width,
    height,
  });

  it.each`
    presentedAttrs | expectedInfoObject
    ${undefined}   | ${undefined}
    ${"active"}    | ${infoAssertion(8, 14, 14, "Active Attributes")}
    ${"candidate"} | ${infoAssertion(6, 15, 15, "Candidate Attributes")}
  `(
    "append nested embedded entity to the graph and paper",
    ({ presentedAttrs, expectedInfoObject }) => {
      const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

      const { graph, paper } = setup();

      const nestedEmbeddedModel: EmbeddedEntity = {
        ...containerModel.embedded_entities[0],
        embedded_entities: [
          { ...containerModel.embedded_entities[0], name: "nested_container" },
        ],
      };

      const entityAttributes = [
        {
          name: "child123",
          parent_entity: "1234",
          nested_container: { name: "child1233", parent_entity: "12346" },
        },
      ];
      const embeddedTo = "123";
      const holderName = "container-service";
      const isBlockedFromEditing = undefined;
      const expectedMap = new Map().set("1234", "parent_entity");
      const expectedMap2 = new Map().set("12346", "parent_entity");

      appendEmbeddedEntity(
        paper,
        graph,
        nestedEmbeddedModel,
        entityAttributes,
        embeddedTo,
        holderName,
        presentedAttrs,
        isBlockedFromEditing,
      );

      expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

      const cells = graph.getCells();
      const filteredCells = graph
        .getCells()
        .filter((cell) => cell.get("type") !== "Link");

      expect(cells).toHaveLength(3); // 3rd cell is a Link
      expect(filteredCells).toHaveLength(2); // 3rd cell is a Link

      //assert first cell
      expect(filteredCells[0].get("entityName")).toBe("child_container");
      expect(filteredCells[0].get("holderName")).toBe("container-service");
      expect(filteredCells[0].get("isEmbedded")).toBe(true);
      expect(filteredCells[0].get("embeddedTo")).toBe("123");

      //we assign to this property attributes without inter-service relations
      expect(filteredCells[0].get("instanceAttributes")).toMatchObject({
        name: entityAttributes[0].name,
      });

      expect(filteredCells[0].get("isBlockedFromEditing")).toBe(
        isBlockedFromEditing,
      );
      expect(filteredCells[0].get("cantBeRemoved")).toBe(true);
      expect(filteredCells[0].get("relatedTo")).toMatchObject(expectedMap);
      expect(filteredCells[1].get("attrs")?.info).toStrictEqual(
        expectedInfoObject,
      );

      //assert second cell
      expect(filteredCells[1].get("entityName")).toBe("nested_container");
      expect(filteredCells[1].get("holderName")).toBe("child_container");

      expect(filteredCells[1].get("isEmbedded")).toBe(true);
      expect(filteredCells[1].get("embeddedTo")).toBe(filteredCells[0].id);

      //we assign to this property attributes without inter-service relations
      expect(filteredCells[1].get("instanceAttributes")).toMatchObject({
        name: entityAttributes[0].nested_container.name,
      });

      expect(filteredCells[1].get("isBlockedFromEditing")).toBe(
        isBlockedFromEditing,
      );
      expect(filteredCells[1].get("cantBeRemoved")).toBe(true);
      expect(filteredCells[1].get("relatedTo")).toMatchObject(expectedMap2);
      expect(filteredCells[1].get("attrs")?.info).toStrictEqual(
        expectedInfoObject,
      );
    },
  );
});

describe("appendInstance", () => {
  const setup = () => {
    const graph = new dia.Graph({});
    const paper = new ComposerPaper({}, graph, true).paper;
    const serviceModels = services as unknown as ServiceModel[];

    return { graph, paper, serviceModels };
  };

  it("throws error if doesn't find serviceModel for given Instance", () => {
    const { graph, paper } = setup();

    expect(() =>
      appendInstance(
        paper,
        graph,
        mockedInstanceWithRelations,
        [],
        true,
        false,
      ),
    ).toThrow("missing Instance Model");
  });

  it("appends instance to the graph", () => {
    const { graph, paper, serviceModels } = setup();

    const mockedInstance: InstanceWithRelations = {
      instance: mockedInstanceWithRelations.instance,
      relatedInstances: [],
    };
    const isCore = true;
    const isBlockedFromEditing = false;

    appendInstance(
      paper,
      graph,
      mockedInstance,
      serviceModels,
      isCore,
      isBlockedFromEditing,
    );

    const cells = graph.getCells();

    expect(cells).toHaveLength(1);
    expect(cells[0].get("entityName")).toBe("parent-service");
    expect(cells[0].get("isCore")).toBe(true);
    expect(cells[0].get("isBlockedFromEditing")).toBe(false);
    expect(cells[0].get("isInEditMode")).toBe(true);
    expect(cells[0].get("cantBeRemoved")).toBe(false);
    expect(cells[0].get("sanitizedAttrs")).toStrictEqual({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(cells[0].get("instanceAttributes")).toStrictEqual({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
  });

  it("appends instance with relations to the graph and paper", () => {
    const { graph, paper, serviceModels } = setup();

    appendInstance(
      paper,
      graph,
      mockedInstanceWithRelations,
      serviceModels,
      true,
      false,
    );
    const cells = graph.getCells();

    expect(cells).toHaveLength(7);

    const filteredCells = cells.filter((cell) => cell.get("type") !== "Link");

    expect(filteredCells).toHaveLength(4);

    expect(filteredCells[0].get("entityName")).toBe("parent-service");
    expect(filteredCells[0].get("isCore")).toBe(true);
    expect(filteredCells[0].get("isEmbedded")).toBe(undefined);
    expect(filteredCells[0].get("isBlockedFromEditing")).toBe(false);
    expect(filteredCells[0].get("isInEditMode")).toBe(true);
    expect(filteredCells[0].get("cantBeRemoved")).toBe(false);
    expect(filteredCells[0].get("sanitizedAttrs")).toStrictEqual({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(filteredCells[0].get("instanceAttributes")).toStrictEqual({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });

    expect(filteredCells[1].get("entityName")).toBe("child-service");
    expect(filteredCells[1].get("isCore")).toBe(undefined);
    expect(filteredCells[1].get("isEmbedded")).toBe(undefined);
    expect(filteredCells[1].get("isBlockedFromEditing")).toBe(true);
    expect(filteredCells[1].get("isInEditMode")).toBe(true);
    expect(filteredCells[1].get("cantBeRemoved")).toBe(false);
    expect(filteredCells[1].get("sanitizedAttrs")).toStrictEqual({
      name: "child-test",
      parent_entity: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
      service_id: "123523534623",
      should_deploy_fail: false,
    });
    expect(filteredCells[1].get("instanceAttributes")).toStrictEqual({
      name: "child-test",
      parent_entity: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
      service_id: "123523534623",
      should_deploy_fail: false,
    });

    expect(filteredCells[2].get("entityName")).toBe("container-service");
    expect(filteredCells[2].get("isCore")).toBe(undefined);
    expect(filteredCells[2].get("isEmbedded")).toBe(undefined);
    expect(filteredCells[2].get("isBlockedFromEditing")).toBe(true);
    expect(filteredCells[2].get("isInEditMode")).toBe(true);
    expect(filteredCells[2].get("cantBeRemoved")).toBe(false);
    expect(filteredCells[2].get("sanitizedAttrs")).toStrictEqual({
      child_container: {
        name: "123124124",
        parent_entity: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
      },
      name: "test-container1123",
      service_id: "123412312",
      should_deploy_fail: false,
    });
    expect(filteredCells[2].get("instanceAttributes")).toStrictEqual({
      child_container: {
        name: "123124124",
        parent_entity: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
      },
      name: "test-container1123",
      service_id: "123412312",
      should_deploy_fail: false,
    });

    expect(filteredCells[3].get("entityName")).toBe("child_container");
    expect(filteredCells[3].get("isCore")).toBe(undefined);
    expect(filteredCells[3].get("isEmbedded")).toBe(true);
    expect(filteredCells[3].get("isBlockedFromEditing")).toBe(true);
    expect(filteredCells[3].get("isInEditMode")).toBe(true);
    expect(filteredCells[3].get("cantBeRemoved")).toBe(true);
    expect(filteredCells[3].get("sanitizedAttrs")).toStrictEqual({
      name: "123124124",
      parent_entity: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
    });
    expect(filteredCells[3].get("instanceAttributes")).toStrictEqual({
      name: "123124124",
      parent_entity: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
    });
  });
});
