import { InstanceAttributeModel } from "@/Core";
import { Service, ServiceInstance } from "@/Test";
import * as uuidApi from "../../../Slices/EditInstance/Data/CommandManager";
import {
  childModel,
  containerModel,
  relatedServices,
  testApiInstance,
  testApiInstanceModel,
  testEmbeddedApiInstances,
} from "./Mock";
import {
  createConnectionRules,
  shapesDataTransform,
  extractRelationsIds,
} from "./helpers";
import { InstanceForApi } from "./interfaces";
jest.spyOn(uuidApi, "create_UUID").mockReturnValue("1");

describe("extractRelationsIds", () => {
  it("Service With no relations in the model gives empty array", () => {
    const ids = extractRelationsIds(
      Service.ServiceWithAllAttrs,
      ServiceInstance.allAttrs,
    );
    expect(ids).toHaveLength(0);
  });

  it("Service With relations in active and candidate sets gives an array with candidate attributes first", () => {
    const ids = extractRelationsIds(
      Service.withRelationsOnly,
      ServiceInstance.with_relations,
    );

    const expectedId = (
      ServiceInstance.with_relations
        .candidate_attributes as InstanceAttributeModel
    )["test_entity"] as string;

    expect(ids).toHaveLength(1);
    expect(ids[0]).toBe(expectedId);
  });

  it("Service With relations in only active set gives an array with active relation id", () => {
    const activeAttrsOnly = {
      ...ServiceInstance.with_relations,
      candidate_attributes: null,
    };
    const ids = extractRelationsIds(Service.withRelationsOnly, activeAttrsOnly);

    const expectedId = (
      ServiceInstance.with_relations.active_attributes as InstanceAttributeModel
    )["test_entity"] as string;

    expect(ids).toHaveLength(1);
    expect(ids[0]).toBe(expectedId);
  });

  it("Service with relations in the model but not in the instance gives empty array", () => {
    const ids = extractRelationsIds(
      Service.withRelationsOnly,
      ServiceInstance.allAttrs,
    );

    expect(ids).toHaveLength(0);
  });
});

describe("createConnectionRules", () => {
  it("empty array and rules object gives back empty object", () => {
    const rules = createConnectionRules([], {});
    expect(rules).toStrictEqual({});
  });

  it("array with service without embedded services and relations gives back empty object", () => {
    const rules = createConnectionRules(
      [{ ...Service.a, embedded_entities: [], inter_service_relations: [] }],
      {},
    );
    expect(rules).toStrictEqual({
      service_name_a: [],
    });
  });

  it("array with service with embedded services and relations gives proper object", () => {
    const rules = createConnectionRules(
      [Service.a, Service.withRelationsOnly],
      {},
    );
    expect(rules).toStrictEqual({
      allocated: [],
      circuits: [
        {
          name: "allocated",
          lowerLimit: 1,
          upperLimit: 1,
          modifier: "r",
          kind: "Embedded",
        },
        {
          name: "customer_endpoint",
          lowerLimit: 1,
          upperLimit: 1,
          modifier: "rw",
          kind: "Embedded",
        },
        {
          name: "csp_endpoint",
          lowerLimit: 1,
          upperLimit: 1,
          modifier: "rw",
          kind: "Embedded",
        },
      ],
      csp_endpoint: [
        {
          name: "allocated",
          lowerLimit: 1,
          upperLimit: 1,
          modifier: "r",
          kind: "Embedded",
        },
      ],
      customer_endpoint: [
        {
          name: "allocated",
          lowerLimit: 1,
          upperLimit: 1,
          modifier: "r",
          kind: "Embedded",
        },
      ],
      service_name_a: [
        {
          name: "circuits",
          lowerLimit: 1,
          upperLimit: 4,
          modifier: "rw+",
          kind: "Embedded",
        },
      ],
      with_relations: [
        {
          name: "test_entity",
          attributeName: "test_entity",
          lowerLimit: 1,
          upperLimit: 5,
          modifier: "rw+",
          kind: "Inter-Service",
        },
      ],
    });
  });

  it("array with service with nested embedded services gives proper object", () => {
    const rules = createConnectionRules([Service.nestedEditable], {});
    expect(rules).toStrictEqual({
      another_embedded: [
        {
          name: "another_embedded_single",
          lowerLimit: null,
          upperLimit: 1,
          modifier: "rw+",
          kind: "Embedded",
        },
      ],
      another_embedded_single: [
        {
          attributeName: "related_service",
          name: "test_entity",
          lowerLimit: null,
          upperLimit: null,
          modifier: "rw",
          kind: "Inter-Service",
        },
      ],
      editable_embedded_entity_relation_with_rw_attributes: [],
      embedded: [
        {
          name: "embedded_single",
          lowerLimit: null,
          upperLimit: 1,
          modifier: "rw",
          kind: "Embedded",
        },
      ],
      embedded_single: [],
      not_editable: [],
      test_service: [
        {
          name: "embedded",
          lowerLimit: null,
          upperLimit: 2,
          modifier: "rw+",
          kind: "Embedded",
        },
        {
          name: "another_embedded",
          lowerLimit: null,
          upperLimit: null,
          modifier: "rw+",
          kind: "Embedded",
        },
        {
          name: "not_editable",
          lowerLimit: 1,
          upperLimit: 1,
          modifier: "rw",
          kind: "Embedded",
        },
        {
          name: "editable_embedded_entity_relation_with_rw_attributes",
          lowerLimit: 1,
          upperLimit: 4,
          modifier: "rw+",
          kind: "Embedded",
        },
        {
          attributeName: "related",
          name: "subnet",
          lowerLimit: null,
          upperLimit: null,
          modifier: "rw",
          kind: "Inter-Service",
        },
      ],
    });
  });
});

describe("shapesDataTransform", () => {
  it("correctly creates object if it is created with embedded objects", () => {
    const createdObject: InstanceForApi = {
      ...testApiInstance,
      action: "create",
    };
    const createdEmbedded: InstanceForApi[] = testEmbeddedApiInstances.map(
      (instance) => {
        return { ...instance, action: "create" };
      },
    );
    const result = shapesDataTransform(
      createdEmbedded,
      createdObject,
      testApiInstanceModel,
    );
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
    const createdObject: InstanceForApi = { ...testApiInstance };
    const createdEmbedded: InstanceForApi[] = [
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
          edit_id: `ae6c9dd7-5392-4374-9f13-df3bb42bf0db_order_update-1`,
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
    const result = shapesDataTransform(
      createdEmbedded,
      createdObject,
      testApiInstanceModel,
    );
    expect(result).toMatchObject(expectedResult);

    //simulate that One isn't changed, second is added
    const createdEmbedded2: InstanceForApi[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];

    const result2 = shapesDataTransform(
      createdEmbedded2,
      createdObject,
      testApiInstanceModel,
    );
    expect(result2).toMatchObject(expectedResult);

    //simulate that One is changed, second is added
    const createdEmbedded3: InstanceForApi[] = [
      { ...testEmbeddedApiInstances[0], action: "update" },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];
    const result3 = shapesDataTransform(
      createdEmbedded3,
      createdObject,
      testApiInstanceModel,
    );
    expect(result3).toMatchObject(expectedResult);
  });

  it("correctly creates object if its embedded values are deleted", () => {
    const createdObject: InstanceForApi = { ...testApiInstance };
    const createdEmbedded: InstanceForApi[] = [
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
          edit_id: `ae6c9dd7-5392-4374-9f13-df3bb42bf0db_order_update-1`,
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
    const result = shapesDataTransform(
      createdEmbedded,
      createdObject,
      testApiInstanceModel,
    );
    expect(result).toMatchObject(expectedResult);
  });
  it("correctly creates object if it is core values are edited", () => {
    const createdObject: InstanceForApi = {
      ...testApiInstance,
      action: "update",
    };
    const createdEmbedded: InstanceForApi[] = [...testEmbeddedApiInstances];
    const expectedResult = {
      instance_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
      service_entity: "embedded-entity-service",
      config: {},
      action: "update",
      edits: [
        {
          edit_id: `ae6c9dd7-5392-4374-9f13-df3bb42bf0db_order_update-1`,
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
    const result = shapesDataTransform(
      createdEmbedded,
      createdObject,
      testApiInstanceModel,
    );
    expect(result).toMatchObject(expectedResult);

    const createdEmbedded2: InstanceForApi[] = testEmbeddedApiInstances.map(
      (instance) => {
        return { ...instance, action: "update" };
      },
    );
    const result2 = shapesDataTransform(
      createdEmbedded2,
      createdObject,
      testApiInstanceModel,
    );
    expect(result2).toMatchObject(expectedResult);

    const createdEmbedded3: InstanceForApi[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];
    const result3 = shapesDataTransform(
      createdEmbedded3,
      createdObject,
      testApiInstanceModel,
    );
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
    const result = shapesDataTransform(
      relatedServices,
      relatedServices[0],
      childModel,
    );
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
      relatedServices,
      relatedServices[1],
      containerModel,
    );
    expect(result).toMatchObject(expectedResult);
  });
});
