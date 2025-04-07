import { Service } from "@/Test";
import { ComposerServiceOrderItem } from "@/UI/Components/Diagram/interfaces";
import {
  childModel,
  containerModel,
  parentModel,
  interServiceRelations,
  testApiInstance,
  testApiInstanceModel,
  testEmbeddedApiInstances,
  serviceModels,
} from "../Mocks";
import { shapesDataTransform, getServiceOrderItems, getKeyAttributesNames } from "./data";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "1"),
}));

describe("shapesDataTransform", () => {
  it("correctly creates object if it is created with embedded objects", () => {
    const createdObject: ComposerServiceOrderItem = {
      ...testApiInstance,
      action: "create",
    };
    const createdEmbedded: ComposerServiceOrderItem[] = testEmbeddedApiInstances.map((instance) => {
      return { ...instance, action: "create" };
    });
    const result = shapesDataTransform(createdObject, createdEmbedded, testApiInstanceModel);

    expect(result).toMatchObject({
      instance_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
      service_entity: "embedded-entity-service",
      config: {},
      action: "create",
      attributes: {
        name: "test-emb",
        service_id: "ebd-123",
        vlan_assigment_r1: {
          address: "1.2.3.5/32",
          vlan_id: 1,
          router_ip: "1.2.3.4",
          interface_name: "eth0",
        },
        vlan_assigment_r2: {
          address: "1.2.3.3/32",
          vlan_id: 123,
          router_ip: "1.2.3.1",
          interface_name: "eth12",
        },
        should_deploy_fail: false,
      },
    });
  });

  it("correctly creates object if only embedded values are edited", () => {
    //simulate that One isn't changed, second is edited
    const createdObject: ComposerServiceOrderItem = { ...testApiInstance };
    const createdEmbedded: ComposerServiceOrderItem[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "update" },
    ];
    const expectedResult = {
      instance_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
      service_entity: "embedded-entity-service",
      config: {},
      action: "update",
      edits: [
        {
          edit_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db_order_update-1",
          operation: "replace",
          target: ".",
          value: {
            name: "test-emb",
            service_id: "ebd-123",
            vlan_assigment_r1: {
              address: "1.2.3.5/32",
              vlan_id: 1,
              router_ip: "1.2.3.4",
              interface_name: "eth0",
            },
            vlan_assigment_r2: {
              address: "1.2.3.3/32",
              vlan_id: 123,
              router_ip: "1.2.3.1",
              interface_name: "eth12",
            },
            should_deploy_fail: false,
          },
        },
      ],
    };
    const result = shapesDataTransform(createdObject, createdEmbedded, testApiInstanceModel);

    expect(result).toMatchObject(expectedResult);

    //simulate that One isn't changed, second is added
    const createdEmbedded2: ComposerServiceOrderItem[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];

    const result2 = shapesDataTransform(createdObject, createdEmbedded2, testApiInstanceModel);

    expect(result2).toMatchObject(expectedResult);

    //simulate that One is changed, second is added
    const createdEmbedded3: ComposerServiceOrderItem[] = [
      { ...testEmbeddedApiInstances[0], action: "update" },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];
    const result3 = shapesDataTransform(createdObject, createdEmbedded3, testApiInstanceModel);

    expect(result3).toMatchObject(expectedResult);
  });

  it("correctly creates object if its embedded values are deleted", () => {
    const createdObject: ComposerServiceOrderItem = { ...testApiInstance };
    const createdEmbedded: ComposerServiceOrderItem[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "delete" },
    ];
    const expectedResult = {
      instance_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
      service_entity: "embedded-entity-service",
      config: {},
      action: "update",
      edits: [
        {
          edit_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db_order_update-1",
          operation: "replace",
          target: ".",
          value: {
            name: "test-emb",
            service_id: "ebd-123",
            vlan_assigment_r1: {
              address: "1.2.3.5/32",
              vlan_id: 1,
              router_ip: "1.2.3.4",
              interface_name: "eth0",
            },
            should_deploy_fail: false,
          },
        },
      ],
    };
    const result = shapesDataTransform(createdObject, createdEmbedded, testApiInstanceModel);

    expect(result).toMatchObject(expectedResult);
  });

  it("correctly creates object if it is core values are edited", () => {
    const createdObject: ComposerServiceOrderItem = {
      ...testApiInstance,
      action: "update",
    };
    const createdEmbedded: ComposerServiceOrderItem[] = [...testEmbeddedApiInstances];
    const expectedResult = {
      instance_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
      service_entity: "embedded-entity-service",
      config: {},
      action: "update",
      edits: [
        {
          edit_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db_order_update-1",
          operation: "replace",
          target: ".",
          value: {
            name: "test-emb",
            service_id: "ebd-123",
            vlan_assigment_r1: {
              address: "1.2.3.5/32",
              vlan_id: 1,
              router_ip: "1.2.3.4",
              interface_name: "eth0",
            },
            vlan_assigment_r2: {
              address: "1.2.3.3/32",
              vlan_id: 123,
              router_ip: "1.2.3.1",
              interface_name: "eth12",
            },
            should_deploy_fail: false,
          },
        },
      ],
    };
    const result = shapesDataTransform(createdObject, createdEmbedded, testApiInstanceModel);

    expect(result).toMatchObject(expectedResult);

    const createdEmbedded2: ComposerServiceOrderItem[] = testEmbeddedApiInstances.map(
      (instance) => {
        return { ...instance, action: "update" };
      }
    );
    const result2 = shapesDataTransform(
      createdObject,
      createdEmbedded2,

      testApiInstanceModel
    );

    expect(result2).toMatchObject(expectedResult);

    const createdEmbedded3: ComposerServiceOrderItem[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];
    const result3 = shapesDataTransform(createdObject, createdEmbedded3, testApiInstanceModel);

    expect(result3).toMatchObject(expectedResult);
  });

  it("correctly creates object if it has inter-service relations", () => {
    const expectedResult = {
      instance_id: "13920268-cce0-4491-93b5-11316aa2fc37",
      service_entity: "child-service",
      config: {},
      action: "create",
      attributes: {
        name: "test123456789",
        service_id: "123test",
        should_deploy_fail: false,
        parent_entity: "6af44f75-ba4b-4fba-9186-cc61c3c9463c",
      },
    };
    const result = shapesDataTransform(interServiceRelations[0], interServiceRelations, childModel);

    expect(result).toMatchObject(expectedResult);
  });

  it("correctly creates object if it has embedded entity with inter-service relations", () => {
    const expectedResult = {
      instance_id: "a4218978-c9ad-4fd8-95e4-b9e9a8c3c653",
      service_entity: "container-service",
      config: {},
      action: "create",
      attributes: {
        name: "test12345",
        service_id: "test12345",
        should_deploy_fail: false,
        child_container: {
          name: "child123",
          parent_entity: "6af44f75-ba4b-4fba-9186-cc61c3c9463c",
        },
      },
    };
    const result = shapesDataTransform(
      interServiceRelations[1],
      interServiceRelations,
      containerModel
    );

    expect(result).toMatchObject(expectedResult);
  });
});

describe("getServiceOrderItems", () => {
  it("bundles basic instances correctly", () => {
    const createdInstance = {
      instance_id: "123",
      service_entity: "basic-service",
      config: {},
      action: "create",
      attributes: {
        address_r1: "123.1.1.4",
        vlan_id_r1: 123,
        address_r2: "123.1.1.1",
        vlan_id_r2: 12,
        short_comment: "This has be to shorter than 10000 characters.",
        name: "test",
        service_id: "1234abc",
        should_deploy_fail: false,
        ip_r1: "124",
        interface_r1_name: "interface_r1",
        ip_r2: "124.1.1.1",
        interface_r2_name: "interface_r2",
      },
      edits: null,
      embeddedTo: undefined,
      relatedTo: undefined,
    };
    const updatedInstance = {
      ...createdInstance,
      attributes: undefined,
      action: "update",
      edits: createdInstance.attributes,
      instance_id: "1234",
    };
    const deletedInstance = {
      instance_id: "12345",
      service_entity: "basic-service",
      config: {},
      action: "delete",
      attributes: null,
      edits: null,
      embeddedTo: undefined,
      relatedTo: undefined,
    };
    const map = new Map();

    map.set("123", createdInstance);
    map.set("1234", updatedInstance);
    map.set("12345", deletedInstance);
    const serviceOrderItems = getServiceOrderItems(map, serviceModels);

    const createdCopy = JSON.parse(JSON.stringify(createdInstance));
    const updatedCopy = JSON.parse(JSON.stringify(updatedInstance));
    const deletedCopy = JSON.parse(JSON.stringify(deletedInstance));

    delete createdCopy.relatedTo;
    delete updatedCopy.relatedTo;
    delete deletedCopy.relatedTo;
    expect(serviceOrderItems).toStrictEqual([createdCopy, updatedCopy, deletedCopy]);
  });

  it("bundles related instances correctly", () => {
    const parentServiceOne = {
      instance_id: "1",
      service_entity: "parent-service",
      config: {},
      action: "create",
      attributes: {
        name: "parent1",
        service_id: "1",
        should_deploy_fail: false,
      },
      edits: null,
      relatedTo: null,
    };
    const parentServiceTwo = {
      ...parentServiceOne,
      instance_id: "2",
      attributes: {
        name: "parent2",
        service_id: "2",
        should_deploy_fail: false,
      },
    };

    const relatedMapChild = new Map();

    relatedMapChild.set("1", "parent_entity");
    const childInstance = {
      instance_id: "11",
      service_entity: "child-service",
      config: {},
      action: "create",
      attributes: {
        name: "child",
        service_id: "11",
        should_deploy_fail: false,
      },
      edits: null,
      relatedTo: relatedMapChild,
    };

    const relatedMapChildManyParents = new Map();

    relatedMapChildManyParents.set("1", "parent_entity");
    relatedMapChildManyParents.set("2", "parent_entity");
    const childWithManyParentsInstance = {
      instance_id: "12",
      service_entity: "child-with-many-parents-service",
      config: {},
      action: "create",
      attributes: {
        name: "child-many",
        service_id: "12",
        should_deploy_fail: false,
      },
      edits: null,
      relatedTo: relatedMapChildManyParents,
    };
    const map = new Map();

    map.set("1", parentServiceOne);
    map.set("2", parentServiceTwo);
    map.set("11", childInstance);
    map.set("12", childWithManyParentsInstance);
    const serviceOrderItems = getServiceOrderItems(map, serviceModels);

    const parentOneCopy = JSON.parse(JSON.stringify(parentServiceOne));
    const parentTwoCopy = JSON.parse(JSON.stringify(parentServiceTwo));
    const childCopy = JSON.parse(JSON.stringify(childInstance));
    const ChildManyCopy = JSON.parse(JSON.stringify(childWithManyParentsInstance));

    delete parentOneCopy.relatedTo;
    delete parentTwoCopy.relatedTo;
    childCopy.attributes.parent_entity = "1";
    delete childCopy.relatedTo;
    ChildManyCopy.attributes.parent_entity = ["1", "2"];
    delete ChildManyCopy.relatedTo;
    expect(serviceOrderItems).toEqual([parentOneCopy, parentTwoCopy, childCopy, ChildManyCopy]);
  });

  it("bundles embedded instances correctly", () => {
    const core = {
      instance_id: "1",
      service_entity: "embedded-entity-service-extra",
      config: {},
      action: "create",
      attributes: {
        name: "",
        service_id: "",
        should_deploy_fail: false,
      },
      edits: null,
      relatedTo: null,
    };
    const embeddedOne = {
      instance_id: "12",
      service_entity: "ro_meta",
      config: {},
      action: "create",
      attributes: {
        name: "",
        meta_data: "",
        other_data: null,
      },
      edits: null,
      embeddedTo: "1",
      relatedTo: null,
    };
    const embeddedTwo = {
      instance_id: "123",
      service_entity: "rw_meta",
      config: {},
      action: "create",
      attributes: {
        name: "",
        meta_data: "",
        other_data: null,
      },
      edits: null,
      embeddedTo: "1",
      relatedTo: null,
    };
    const embeddedThree = {
      instance_id: "1234",
      service_entity: "ro_files",
      config: {},
      action: "create",
      attributes: {
        name: "",
        data: "",
      },
      edits: null,
      embeddedTo: "1",
      relatedTo: null,
    };
    const embeddedFour = {
      instance_id: "12345",
      service_entity: "ro_files",
      config: {},
      action: "create",
      attributes: {
        name: "",
        data: "",
      },
      edits: null,
      embeddedTo: "1",
      relatedTo: null,
    };
    const map = new Map();

    map.set("1", core);
    map.set("12", embeddedOne);
    map.set("123", embeddedTwo);
    map.set("1234", embeddedThree);
    map.set("12345", embeddedFour);
    const serviceOrderItems = getServiceOrderItems(map, serviceModels);

    const coreCopy = JSON.parse(JSON.stringify(core));

    delete coreCopy.relatedTo;
    coreCopy.attributes[embeddedOne.service_entity] = embeddedOne.attributes;
    coreCopy.attributes[embeddedTwo.service_entity] = embeddedTwo.attributes;
    coreCopy.attributes[embeddedThree.service_entity] = [
      embeddedThree.attributes,
      embeddedFour.attributes,
    ];
    expect(serviceOrderItems).toEqual([coreCopy]);
  });
});

describe("getKeyAttributesNames", () => {
  it("returns an empty array when there are no key attributes or identity value", () => {
    const result = getKeyAttributesNames(Service.a);

    expect(result).toEqual([]);
  });
  it("returns an array with key attributes names when there are key attributes", () => {
    const result = getKeyAttributesNames({
      ...containerModel,
      embedded_entities: [{ ...containerModel.embedded_entities[0], key_attributes: [] }],
    });

    expect(result).toEqual(["name"]);
  });
  it("returns an array with identity value when there is identity value", () => {
    const result = getKeyAttributesNames(parentModel);

    expect(result).toEqual(["name"]);
  });
  it("returns an array without duplicates when key attributes and identity value overlaps", () => {
    const result = getKeyAttributesNames({
      ...containerModel,
      service_identity: "name",
    });

    expect(result).toEqual(["name"]);
  });
});
