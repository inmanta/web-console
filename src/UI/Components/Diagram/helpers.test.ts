import { InstanceAttributeModel } from "@/Core";
import { Service, ServiceInstance } from "@/Test";
import { testApiInstance, testEmbeddedApiInstances } from "./Mock";
import {
  createConnectionRules,
  embedObjects,
  extractRelationsIds,
} from "./helpers";
import { InstanceForApi } from "./interfaces";

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
        },
        {
          name: "customer_endpoint",
          lowerLimit: 1,
          upperLimit: 1,
        },
        {
          name: "csp_endpoint",
          lowerLimit: 1,
          upperLimit: 1,
        },
      ],
      csp_endpoint: [
        {
          name: "allocated",
          lowerLimit: 1,
          upperLimit: 1,
        },
      ],
      customer_endpoint: [
        {
          name: "allocated",
          lowerLimit: 1,
          upperLimit: 1,
        },
      ],
      service_name_a: [
        {
          name: "circuits",
          lowerLimit: 1,
          upperLimit: 4,
        },
      ],
      with_relations: [
        {
          name: "test_entity",
          lowerLimit: 1,
          upperLimit: 5,
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
        },
      ],
      another_embedded_single: [
        {
          name: "test_entity",
          lowerLimit: null,
          upperLimit: null,
        },
      ],
      editable_embedded_entity_relation_with_rw_attributes: [],
      embedded: [
        {
          name: "embedded_single",
          lowerLimit: null,
          upperLimit: 1,
        },
      ],
      embedded_single: [],
      not_editable: [],
      test_service: [
        {
          name: "embedded",
          lowerLimit: null,
          upperLimit: 2,
        },
        {
          name: "another_embedded",
          lowerLimit: null,
          upperLimit: null,
        },
        {
          name: "not_editable",
          lowerLimit: 1,
          upperLimit: 1,
        },
        {
          name: "editable_embedded_entity_relation_with_rw_attributes",
          lowerLimit: 1,
          upperLimit: 4,
        },
        {
          name: "subnet",
          lowerLimit: null,
          upperLimit: null,
        },
      ],
    });
  });
});

describe("embedObjects", () => {
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
    const result = embedObjects(createdEmbedded, createdObject);
    expect(result).toMatchObject({
      instance_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
      service_entity: "embedded-entity-service",
      config: {},
      action: "create",
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
    });
  });

  it("correctly creates object if it is core values are edited", () => {
    const createdObject: InstanceForApi = {
      ...testApiInstance,
      action: "update",
    };
    const createdEmbedded: InstanceForApi[] = testEmbeddedApiInstances;
    const expectedResult = {
      instance_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
      service_entity: "embedded-entity-service",
      config: {},
      action: "update",
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
    };
    const result = embedObjects(createdEmbedded, createdObject);
    expect(result).toMatchObject(expectedResult);

    const createdEmbedded2: InstanceForApi[] = testEmbeddedApiInstances.map(
      (instance) => {
        return { ...instance, action: "update" };
      },
    );
    const result2 = embedObjects(createdEmbedded2, createdObject);
    expect(result2).toMatchObject(expectedResult);

    const createdEmbedded3: InstanceForApi[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];
    const result3 = embedObjects(createdEmbedded3, createdObject);
    expect(result3).toMatchObject(expectedResult);
  });

  it("correctly creates object if only embedded values are edited", () => {
    //simulate that One isn't changed, second is edited
    const createdObject: InstanceForApi = testApiInstance;
    const createdEmbedded: InstanceForApi[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "update" },
    ];
    const expectedResult = {
      instance_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
      service_entity: "embedded-entity-service",
      config: {},
      action: "update",
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
    };
    const result = embedObjects(createdEmbedded, createdObject);
    expect(result).toMatchObject(expectedResult);

    //simulate that One isn't changed, second is added
    const createdEmbedded2: InstanceForApi[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];

    const result2 = embedObjects(createdEmbedded2, createdObject);
    expect(result2).toMatchObject(expectedResult);

    //simulate that One is changed, second is added
    const createdEmbedded3: InstanceForApi[] = [
      { ...testEmbeddedApiInstances[0], action: "update" },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];
    const result3 = embedObjects(createdEmbedded3, createdObject);
    expect(result3).toMatchObject(expectedResult);
  });

  it("correctly creates object if it is embedded values are deleted", () => {
    const createdObject: InstanceForApi = testApiInstance;
    const createdEmbedded: InstanceForApi[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "delete" },
    ];
    const expectedResult = {
      instance_id: "ae6c9dd7-5392-4374-9f13-df3bb42bf0db",
      service_entity: "embedded-entity-service",
      config: {},
      action: "update",
      value: {
        name: "test-emb",
        service_id: "ebd-123",
        vlan_assigment_r1: {
          address: "1.2.3.5/32",
          vlan_id: 1,
          router_ip: "1.2.3.4",
          interface_name: "eth0",
        },
        vlan_assigment_r2: null,
        should_deploy_fail: false,
      },
    };
    const result = embedObjects(createdEmbedded, createdObject);
    expect(result).obj(expectedResult);
  });
});
