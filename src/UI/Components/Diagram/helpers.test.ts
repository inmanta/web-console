import { dia } from "@inmanta/rappid";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
import { Service, ServiceInstance } from "@/Test";
import {
  a as InstanceAttributesA,
  b as InstanceAttributesB,
} from "@/Test/Data/ServiceInstance/Attributes";
import * as uuidApi from "../../../Slices/EditInstance/Data/CommandManager";
import {
  childModel,
  containerModel,
  relatedServices,
  testApiInstance,
  testApiInstanceModel,
  testEmbeddedApiInstances,
} from "./Mock";
import services from "./Mocks/services.json";
import { appendEntity } from "./actions";
import {
  createConnectionRules,
  shapesDataTransform,
  extractRelationsIds,
  checkWhetherConnectionRulesAreExhausted,
  findCorrespondingId,
  bundleInstances,
  checkIfConnectionIsAllowed,
} from "./helpers";
import {
  EmbeddedRule,
  InstanceForApi,
  InterServiceRule,
  TypeEnum,
} from "./interfaces";
import { EntityConnection, ServiceEntityBlock } from "./shapes";
jest.spyOn(uuidApi, "create_UUID").mockReturnValue("1");

describe("extractRelationsIds", () => {
  it("Service With no relations in the model gives empty array", () => {
    const ids = extractRelationsIds(
      Service.ServiceWithAllAttrs,
      ServiceInstance.allAttrs,
    );
    expect(ids).toHaveLength(0);
  });

  it("Service With relations property set to undefined in the model gives empty array", () => {
    const ids = extractRelationsIds(
      { ...Service.ServiceWithAllAttrs, inter_service_relations: undefined },
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

  it("Service With relations in only rollback set gives empty array", () => {
    const activeAttrsOnly = {
      ...ServiceInstance.with_relations,
      candidate_attributes: null,
      active_attributes: null,
      rollback_attributes: ServiceInstance.with_relations.active_attributes,
    };
    const ids = extractRelationsIds(Service.withRelationsOnly, activeAttrsOnly);
    expect(ids).toHaveLength(0);
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
          modifier: "rw+",
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

describe("checkWhetherConnectionRulesAreExhausted", () => {
  const mockedMatchingEmbedded = {
    getName: () => "testEmbedded",
  } as ServiceEntityBlock;
  const mockedEmbedded = {
    getName: () => "testEmbeddedOne",
  } as ServiceEntityBlock;

  const mockedMatchingInterService = {
    getName: () => "testInterService",
  } as ServiceEntityBlock;
  const mockedInterService = {
    getName: () => "testInterServiceOne",
  } as ServiceEntityBlock;

  const embeddedRule: EmbeddedRule = {
    kind: TypeEnum.EMBEDDED,
    name: "testEmbedded",
    lowerLimit: 0,
    upperLimit: 1,
    modifier: "rw",
  };
  const relationRule: InterServiceRule = {
    kind: TypeEnum.INTERSERVICE,
    name: "testInterService",
    lowerLimit: 0,
    upperLimit: 1,
    modifier: "rw",
    attributeName: "attr",
  };
  it("assert connections exhaustion when rule has modifier set to 'rw'", () => {
    //editMode set to true
    expect(
      checkWhetherConnectionRulesAreExhausted([], embeddedRule, true),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedEmbedded],
        embeddedRule,
        true,
      ),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded],
        embeddedRule,
        true,
      ),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        embeddedRule,
        true,
      ),
    ).toBeTruthy();

    expect(
      checkWhetherConnectionRulesAreExhausted([], relationRule, true),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedInterService],
        relationRule,
        true,
      ),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService],
        relationRule,
        true,
      ),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        relationRule,
        true,
      ),
    ).toBeTruthy();

    //editMode set to false
    expect(
      checkWhetherConnectionRulesAreExhausted([], embeddedRule, false),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedEmbedded],
        embeddedRule,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded],
        embeddedRule,
        false,
      ),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        embeddedRule,
        false,
      ),
    ).toBeTruthy();

    expect(
      checkWhetherConnectionRulesAreExhausted([], relationRule, false),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedInterService],
        relationRule,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService],
        relationRule,
        false,
      ),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        relationRule,
        false,
      ),
    ).toBeTruthy();
  });

  it("assert connections exhaustion when rule has modifier set to 'rw+' ", () => {
    const rwEmbeddedRule: EmbeddedRule = {
      ...embeddedRule,
      modifier: "rw+",
    };
    const rwRelationRule: InterServiceRule = {
      ...relationRule,
      modifier: "rw+",
    };

    //editMode set to true
    expect(
      checkWhetherConnectionRulesAreExhausted([], rwEmbeddedRule, true),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedEmbedded],
        rwEmbeddedRule,
        true,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded],
        rwEmbeddedRule,
        true,
      ),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        rwEmbeddedRule,
        true,
      ),
    ).toBeTruthy();

    expect(
      checkWhetherConnectionRulesAreExhausted([], rwRelationRule, true),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedInterService],
        rwRelationRule,
        true,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService],
        rwRelationRule,
        true,
      ),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        rwRelationRule,
        true,
      ),
    ).toBeTruthy();

    //editMode set to false
    expect(
      checkWhetherConnectionRulesAreExhausted([], rwEmbeddedRule, false),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedEmbedded],
        rwEmbeddedRule,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded],
        rwEmbeddedRule,
        false,
      ),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        rwEmbeddedRule,
        false,
      ),
    ).toBeTruthy();

    expect(
      checkWhetherConnectionRulesAreExhausted([], rwRelationRule, false),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedInterService],
        rwRelationRule,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService],
        rwRelationRule,
        false,
      ),
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        rwRelationRule,
        false,
      ),
    ).toBeTruthy();
  });

  it("assert connections exhaustion when rule has upper limit set to null or undefined", () => {
    const EmbeddedRuleUndefinedLimit: EmbeddedRule = {
      ...embeddedRule,
      upperLimit: undefined,
    };
    const RelationRuleUndefinedLimit: InterServiceRule = {
      ...relationRule,
      upperLimit: undefined,
    };
    //editMode set to false
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [],
        EmbeddedRuleUndefinedLimit,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedEmbedded],
        EmbeddedRuleUndefinedLimit,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded],
        EmbeddedRuleUndefinedLimit,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        EmbeddedRuleUndefinedLimit,
        false,
      ),
    ).toBeFalsy();

    expect(
      checkWhetherConnectionRulesAreExhausted(
        [],
        RelationRuleUndefinedLimit,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedInterService],
        RelationRuleUndefinedLimit,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService],
        RelationRuleUndefinedLimit,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        RelationRuleUndefinedLimit,
        false,
      ),
    ).toBeFalsy();

    const EmbeddedRuleNoLimit: EmbeddedRule = {
      ...embeddedRule,
      upperLimit: null,
    };
    const RelationRuleNoLimit: InterServiceRule = {
      ...relationRule,
      upperLimit: null,
    };
    //editMode set to false
    expect(
      checkWhetherConnectionRulesAreExhausted([], EmbeddedRuleNoLimit, false),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedEmbedded],
        EmbeddedRuleNoLimit,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded],
        EmbeddedRuleNoLimit,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        EmbeddedRuleNoLimit,
        false,
      ),
    ).toBeFalsy();

    expect(
      checkWhetherConnectionRulesAreExhausted([], RelationRuleNoLimit, false),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedInterService],
        RelationRuleNoLimit,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService],
        RelationRuleNoLimit,
        false,
      ),
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        RelationRuleNoLimit,
        false,
      ),
    ).toBeFalsy();
  });
});

Object.defineProperty(global.SVGElement.prototype, "getComputedTextLength", {
  writable: true,
  value: jest.fn().mockReturnValue(0),
});
Object.defineProperty(global.SVGElement.prototype, "getBBox", {
  writable: true,
  value: jest.fn().mockReturnValue({
    x: 0,
    y: 0,
  }),
});
Object.defineProperty(global.SVGSVGElement.prototype, "createSVGMatrix", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    martix: jest.fn(() => [[]]),
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
    f: 0,
    flipX: jest.fn().mockImplementation(() => global.SVGSVGElement),
    flipY: jest.fn().mockImplementation(() => global.SVGSVGElement),
    inverse: jest.fn().mockImplementation(() => global.SVGSVGElement),
    multiply: jest.fn().mockImplementation(() => global.SVGSVGElement),
    rotate: jest.fn().mockImplementation(() => global.SVGSVGElement),
    rotateFromVector: jest.fn().mockImplementation(() => global.SVGSVGElement),
    scale: jest.fn().mockImplementation(() => global.SVGSVGElement),
    scaleNonUniform: jest.fn().mockImplementation(() => global.SVGSVGElement),
    skewX: jest.fn().mockImplementation(() => global.SVGSVGElement),
    skewY: jest.fn().mockImplementation(() => global.SVGSVGElement),
    translate: jest.fn().mockImplementation(() => ({
      multiply: jest.fn().mockImplementation(() => ({
        multiply: jest.fn().mockImplementation(() => global.SVGSVGElement),
      })),
      rotate: jest.fn().mockImplementation(() => ({
        translate: jest.fn().mockImplementation(() => ({
          rotate: jest.fn().mockImplementation(() => ({
            translate: jest.fn().mockImplementation(() => global.SVGSVGElement),
          })),
        })),
      })),
    })),
  })),
});
Object.defineProperty(global.SVGSVGElement.prototype, "createSVGPoint", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    x: 0,
    y: 0,
    matrixTransform: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
    })),
  })),
});
describe("checkIfConnectionIsAllowed", () => {
  it("WHEN one element has rule describing other THEN return true", () => {
    const rules = createConnectionRules([Service.a], {});
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });
    const serviceA = appendEntity(graph, Service.a, InstanceAttributesA, false);
    const serviceB = appendEntity(
      graph,
      Service.a.embedded_entities[0],
      (InstanceAttributesA["circuits"] as InstanceAttributeModel[])[0],
      false,
    );

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(serviceB),
      rules,
    );
    expect(result).toBeTruthy();
  });
  it("WHEN one element has not rule describing other THEN returns false", () => {
    const rules = createConnectionRules([Service.a, Service.b], {});
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });
    const serviceA = appendEntity(graph, Service.a, InstanceAttributesA, false);
    const serviceB = appendEntity(graph, Service.b, InstanceAttributesB, false);

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(serviceB),
      rules,
    );
    expect(result).toBeFalsy();
  });

  it("WHEN one element has rule describing other, but the other is blocked from editing THEN return false", () => {
    const rules = createConnectionRules([Service.a], {});
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });
    const serviceA = appendEntity(graph, Service.a, InstanceAttributesA, false);
    const serviceB = appendEntity(
      graph,
      Service.a.embedded_entities[0],
      (InstanceAttributesA["circuits"] as InstanceAttributeModel[])[0],
      false,
      true,
    );
    serviceA.set("isBlockedFromEditing", true);

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(serviceB),
      rules,
    );
    expect(result).toBeFalsy();
  });

  it("WHEN one element has rule describing other, but the other is and embedded entity already connected to parent THEN return false", () => {
    const rules = createConnectionRules([Service.a], {});
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    const serviceA = appendEntity(graph, Service.a, InstanceAttributesA, false);
    const serviceA2 = appendEntity(
      graph,
      Service.a,
      InstanceAttributesA,
      false,
    );
    const serviceB = appendEntity(
      graph,
      Service.a.embedded_entities[0],
      (InstanceAttributesA["circuits"] as InstanceAttributeModel[])[0],
      false,
      true,
    );

    const link = new EntityConnection();
    link.source(serviceA2);
    link.target(serviceB);
    link.addTo(graph);
    serviceB.set("holderName", "service_name_a");

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(serviceB),
      rules,
    );
    expect(result).toBeFalsy();
  });
});

describe("findCorrespondingId", () => {
  const mockedInstance = {
    id: "1245",
  } as ServiceEntityBlock;
  it("return undefined on empty Map", () => {
    expect(findCorrespondingId(new Map(), mockedInstance)).toBeUndefined();
  });
  it("return undefined on Map withouth corresponding instance id", () => {
    const map = new Map();
    map.set("123", "different-instance");
    expect(findCorrespondingId(map, mockedInstance)).toBeUndefined();
  });
  it("return object on Map with corresponding instance id", () => {
    const map = new Map();
    map.set("1245", "matching-instance");

    expect(findCorrespondingId(map, mockedInstance)).toEqual({
      id: "1245",
      attributeName: "matching-instance",
    });
  });
});

describe("bundleInstances", () => {
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
      instance_id: "1234",
      service_entity: "basic-service",
      config: {},
      action: "create",
      attributes: {
        address_r1: "123.1.1.4",
        vlan_id_r1: 123,
        address_r2: "123.1.1.1",
        vlan_id_r2: 12,
        short_comment: "This has be to shorter than 10000 characters.",
        name: "testtwo",
        service_id: "1234abcde",
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
    const bundledInstances = bundleInstances(
      map,
      services as unknown as ServiceModel[],
    );

    const createdCopy = JSON.parse(JSON.stringify(createdInstance));
    const updatedCopy = JSON.parse(JSON.stringify(updatedInstance));
    const deletedCopy = JSON.parse(JSON.stringify(deletedInstance));
    delete createdCopy.relatedTo;
    delete updatedCopy.relatedTo;
    delete deletedCopy.relatedTo;
    expect(bundledInstances).toEqual([createdCopy, updatedCopy, deletedCopy]);
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
      instance_id: "2",
      service_entity: "parent-service",
      config: {},
      action: "create",
      attributes: {
        name: "parent2",
        service_id: "2",
        should_deploy_fail: false,
      },
      edits: null,
      relatedTo: null,
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
    const bundledInstances = bundleInstances(
      map,
      services as unknown as ServiceModel[],
    );

    const parentOneCopy = JSON.parse(JSON.stringify(parentServiceOne));
    const parentTwoCopy = JSON.parse(JSON.stringify(parentServiceTwo));
    const childCopy = JSON.parse(JSON.stringify(childInstance));
    const ChildManyCopy = JSON.parse(
      JSON.stringify(childWithManyParentsInstance),
    );
    delete parentOneCopy.relatedTo;
    delete parentTwoCopy.relatedTo;
    childCopy.attributes.parent_entity = "1";
    delete childCopy.relatedTo;
    ChildManyCopy.attributes.parent_entity = ["1", "2"];
    delete ChildManyCopy.relatedTo;
    expect(bundledInstances).toEqual([
      parentOneCopy,
      parentTwoCopy,
      childCopy,
      ChildManyCopy,
    ]);
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
    const bundledInstances = bundleInstances(
      map,
      services as unknown as ServiceModel[],
    );

    const coreCopy = JSON.parse(JSON.stringify(core));
    delete coreCopy.relatedTo;
    coreCopy.attributes[embeddedOne.service_entity] = embeddedOne.attributes;
    coreCopy.attributes[embeddedTwo.service_entity] = embeddedTwo.attributes;
    coreCopy.attributes[embeddedThree.service_entity] = [
      embeddedThree.attributes,
      embeddedFour.attributes,
    ];
    expect(bundledInstances).toEqual([coreCopy]);
  });
});
