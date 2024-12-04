import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/GETTERS/GetInstanceWithRelations";
import { containerModel, mockedInstanceWithRelations } from "../Mocks";
import services from "../Mocks/services.json";
import {
  appendEmbeddedEntity,
  appendInstance,
  addInfoIcon,
} from "../actions/editMode";
import { ComposerPaper } from "../paper";
import { ServiceEntityBlock } from "../shapes";
import { defineObjectsForJointJS } from "../testSetup";

beforeAll(() => {
  defineObjectsForJointJS();
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
    ${{ name: "child123" }}                        | ${"123"}   | ${"container-service"} | ${false}             | ${new Map([])}
    ${{ name: "child123", parent_entity: "1234" }} | ${"123"}   | ${"container-service"} | ${false}             | ${new Map().set("1234", "parent_entity")}
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
      expect(cells[0].get("isEmbeddedEntity")).toBe(true);
      expect(cells[0].get("embeddedTo")).toBe("123");

      //we assign to this property attributes without inter-service relations
      expect(cells[0].get("instanceAttributes")).toMatchObject({
        name: entityAttributes.name,
      });

      expect(cells[0].get("isBlockedFromEditing")).toBe(isBlockedFromEditing);
      expect(cells[0].get("cantBeRemoved")).toBe(true);
      expect(cells[0].get("relatedTo")).toMatchObject(expectedMap);
      expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
      //assert the arguments of the first call - calls is array of the arguments of each call
      expect(
        (dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail,
      ).toMatchObject({
        name: "child_container",
        id: expect.any(String),
        relations: [{ currentAmount: 0, min: 1, name: "parent-service" }],
      }); //add relations to Tracker

      //assert the arguments of the second call - calls is array of the arguments of each call
      expect(
        (dispatchEventSpy.mock.calls[1][0] as CustomEvent).detail,
      ).toMatchObject({
        action: "add",
        name: "child_container",
      }); //update stencil state
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
    );

    const cells = graph.getCells();

    expect(cells).toHaveLength(2);
    expect(dispatchEventSpy).toHaveBeenCalledTimes(4);

    //assert first cell
    expect(cells[0].get("entityName")).toBe("child_container");
    expect(cells[0].get("isEmbeddedEntity")).toBe(true);
    expect(cells[0].get("embeddedTo")).toBe("123");

    expect(cells[0].get("isBlockedFromEditing")).toBe(false);
    expect(cells[0].get("cantBeRemoved")).toBe(true);
    expect(cells[0].get("relatedTo")).toMatchObject(expectedMap);

    //assert second cell
    expect(cells[1].get("entityName")).toBe("child_container");
    expect(cells[1].get("isEmbeddedEntity")).toBe(true);
    expect(cells[1].get("embeddedTo")).toBe("123");

    expect(cells[1].get("isBlockedFromEditing")).toBe(false);
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
      const isBlockedFromEditing = false;
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
      );

      expect(dispatchEventSpy).toHaveBeenCalledTimes(4);

      const cells = graph.getCells();
      const filteredCells = graph
        .getCells()
        .filter((cell) => cell.get("type") !== "Link");

      expect(cells).toHaveLength(3); // 3rd cell is a Link
      expect(filteredCells).toHaveLength(2); // 3rd cell is a Link

      //assert first cell
      expect(filteredCells[0].get("entityName")).toBe("child_container");
      expect(filteredCells[0].get("holderName")).toBe("container-service");
      expect(filteredCells[0].get("isEmbeddedEntity")).toBe(true);
      expect(filteredCells[0].get("embeddedTo")).toBe("123");

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

      expect(filteredCells[1].get("isEmbeddedEntity")).toBe(true);
      expect(filteredCells[1].get("embeddedTo")).toBe(filteredCells[0].id);

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

  it(`doesn't append nested embedded entities with "r" modifier to the graph or paper`, () => {
    const { graph, paper, embeddedModel } = setup();
    const rModel = {
      ...embeddedModel,
      embedded_entities: [
        { ...embeddedModel, name: "container-r", modifier: "r" },
      ],
    };
    const presentedAttrs = undefined;
    const isBlockedFromEditing = false;
    const entityAttributes = {};
    const embeddedTo = "123";
    const holderName = "test";

    appendEmbeddedEntity(
      paper,
      graph,
      rModel,
      entityAttributes,
      embeddedTo,
      holderName,
      presentedAttrs,
      isBlockedFromEditing,
    );

    const cells = graph.getCells();

    expect(cells).toHaveLength(1);

    expect(cells[0].get("entityName")).toBe("child_container");
  });
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
    ).toThrow("The instance attribute model is missing");
  });

  it("appends instance to the graph", () => {
    const { graph, paper, serviceModels } = setup();

    const mockedInstance: InstanceWithRelations = {
      instance: mockedInstanceWithRelations.instance,
      interServiceRelations: [],
    };
    const isCore = true;

    appendInstance(paper, graph, mockedInstance, serviceModels, isCore);

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

    //assert that the first cell is the parent-service, which would be core instance and has it's attributes set as expected
    expect(filteredCells[0].get("entityName")).toBe("parent-service");
    expect(filteredCells[0].get("isCore")).toBe(true);
    expect(filteredCells[0].get("isEmbeddedEntity")).toBe(undefined);
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

    //assert that the first cell is the child-service, which would be inter-service relation in edit mode and has its attributes set as expected
    expect(filteredCells[1].get("entityName")).toBe("child-service");
    expect(filteredCells[1].get("isCore")).toBe(undefined);
    expect(filteredCells[1].get("isEmbeddedEntity")).toBe(undefined);
    expect(filteredCells[1].get("isBlockedFromEditing")).toBe(true);
    expect(filteredCells[1].get("isInEditMode")).toBe(true);
    expect(filteredCells[1].get("cantBeRemoved")).toBe(false);
    expect(filteredCells[3].get("relatedTo")).toStrictEqual(
      new Map().set("085cdf92-0894-4b82-8d46-1dd9552e7ba3", "parent_entity"),
    );
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

    //assert that the first cell is the container-service, which would be main body of another inter-service relation in edit mode and has its attributes set as expected
    expect(filteredCells[2].get("entityName")).toBe("container-service");
    expect(filteredCells[2].get("isCore")).toBe(undefined);
    expect(filteredCells[2].get("isEmbeddedEntity")).toBe(undefined);
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

    //assert that the first cell is the container-service, which would be embedded entity of container-service and would be target point of inter-service relation in edit mode and has its attributes set as expected
    expect(filteredCells[3].get("entityName")).toBe("child_container");
    expect(filteredCells[3].get("isCore")).toBe(undefined);
    expect(filteredCells[3].get("isEmbeddedEntity")).toBe(true);
    expect(filteredCells[3].get("isBlockedFromEditing")).toBe(true);
    expect(filteredCells[3].get("isInEditMode")).toBe(true);
    expect(filteredCells[3].get("cantBeRemoved")).toBe(true);
    expect(filteredCells[3].get("holderName")).toBe("container-service");
    expect(filteredCells[3].get("embeddedTo")).toBe(
      "1548332f-86ab-42fe-bd32-4f3adb9e650b",
    );
    expect(filteredCells[3].get("relatedTo")).toStrictEqual(
      new Map().set("085cdf92-0894-4b82-8d46-1dd9552e7ba3", "parent_entity"),
    );

    expect(filteredCells[3].get("sanitizedAttrs")).toStrictEqual({
      name: "123124124",
      parent_entity: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
    });
    expect(filteredCells[3].get("instanceAttributes")).toStrictEqual({
      name: "123124124",
      parent_entity: "085cdf92-0894-4b82-8d46-1dd9552e7ba3",
    });
  });

  it("won't append embedded entities with modifier 'r' to the graph or paper", () => {
    const { graph, paper } = setup();
    const rModel: ServiceModel = {
      ...containerModel,
      embedded_entities: [
        { ...containerModel.embedded_entities[0], modifier: "r" },
      ],
    };

    const mockedInstance: InstanceWithRelations = {
      instance: mockedInstanceWithRelations.interServiceRelations[1], // container service
      interServiceRelations: [],
    };
    const isCore = true;

    appendInstance(paper, graph, mockedInstance, [rModel], isCore);

    const cells = graph.getCells();

    expect(cells).toHaveLength(1);

    expect(cells[0].get("entityName")).toBe("container-service");
  });
});
