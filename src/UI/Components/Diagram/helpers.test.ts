import { dia } from "@inmanta/rappid";
import {
  InstanceAttributeModel,
  ServiceInstanceModelWithTargetStates,
  ServiceModel,
} from "@/Core";
import { Service, ServiceInstance } from "@/Test";
import {
  a as InstanceAttributesA,
  b as InstanceAttributesB,
} from "@/Test/Data/ServiceInstance/Attributes";
import {
  ComposerServiceOrderItem,
  ConnectionRules,
  EventActionEnum,
  EmbeddedRule,
  InterServiceRule,
  LabelLinkView,
  TypeEnum,
} from "@/UI/Components/Diagram/interfaces";
import {
  childModel,
  containerModel,
  parentModel,
  interServiceRelations,
  testApiInstance,
  testApiInstanceModel,
  testEmbeddedApiInstances,
} from "./Mocks";
import services from "./Mocks/services.json";
import { createComposerEntity } from "./actions";
import {
  createConnectionRules,
  shapesDataTransform,
  extractRelationsIds,
  checkWhetherConnectionRulesAreExhausted,
  findCorrespondingId,
  getServiceOrderItems,
  checkIfConnectionIsAllowed,
  updateLabelPosition,
  toggleLooseElement,
  findInterServiceRelations,
  findFullInterServiceRelations,
  showLinkTools,
} from "./helpers";
import { ComposerPaper } from "./paper";
import { Link, ServiceEntityBlock } from "./shapes";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "1"),
}));

describe("extractRelationsIds", () => {
  const serviceInstanceForThirdTest = {
    ...ServiceInstance.with_relations,
    candidate_attributes: null,
    active_attributes: null,
    rollback_attributes: ServiceInstance.with_relations.active_attributes,
  };

  it.each`
    serviceModel                          | serviceInstance                | expectedLength
    ${Service.ServiceWithAllAttrs}        | ${ServiceInstance.allAttrs}    | ${0}
    ${{ ...Service.ServiceWithAllAttrs }} | ${ServiceInstance.allAttrs}    | ${0}
    ${Service.withRelationsOnly}          | ${serviceInstanceForThirdTest} | ${0}
    ${Service.withRelationsOnly}          | ${ServiceInstance.allAttrs}    | ${0}
  `(
    "should return empty array for given service model examples",
    ({
      serviceModel,
      serviceInstance,
      expectedLength,
    }: {
      serviceModel: ServiceModel;
      serviceInstance: ServiceInstanceModelWithTargetStates;
      expectedLength: number;
    }) => {
      const ids = extractRelationsIds(serviceModel, serviceInstance);

      expect(ids).toHaveLength(expectedLength);
    },
  );

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
});

describe("createConnectionRules", () => {
  const rulesForSecondTest = {
    service_name_a: [],
  };

  const rulesForThirdTest = {
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
  };

  const rulesForFourthTests = {
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
  };

  it.each`
    services                                                                  | expectedRules
    ${[]}                                                                     | ${{}}
    ${[{ ...Service.a, embedded_entities: [], inter_service_relations: [] }]} | ${rulesForSecondTest}
    ${[Service.a, Service.withRelationsOnly]}                                 | ${rulesForThirdTest}
    ${[Service.nestedEditable]}                                               | ${rulesForFourthTests}
  `(
    "returns correct rules for given services",
    ({
      services,
      expectedRules,
    }: {
      services: ServiceModel[];
      expectedRules: ConnectionRules;
    }) => {
      const rules = createConnectionRules(services, {});

      expect(rules).toStrictEqual(expectedRules);
    },
  );
});

describe("shapesDataTransform", () => {
  it("correctly creates object if it is created with embedded objects", () => {
    const createdObject: ComposerServiceOrderItem = {
      ...testApiInstance,
      action: "create",
    };
    const createdEmbedded: ComposerServiceOrderItem[] =
      testEmbeddedApiInstances.map((instance) => {
        return { ...instance, action: "create" };
      });
    const result = shapesDataTransform(
      createdObject,
      createdEmbedded,
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
      createdObject,
      createdEmbedded,
      testApiInstanceModel,
    );

    expect(result).toMatchObject(expectedResult);

    //simulate that One isn't changed, second is added
    const createdEmbedded2: ComposerServiceOrderItem[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];

    const result2 = shapesDataTransform(
      createdObject,
      createdEmbedded2,
      testApiInstanceModel,
    );

    expect(result2).toMatchObject(expectedResult);

    //simulate that One is changed, second is added
    const createdEmbedded3: ComposerServiceOrderItem[] = [
      { ...testEmbeddedApiInstances[0], action: "update" },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];
    const result3 = shapesDataTransform(
      createdObject,
      createdEmbedded3,
      testApiInstanceModel,
    );

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
      createdObject,
      createdEmbedded,
      testApiInstanceModel,
    );

    expect(result).toMatchObject(expectedResult);
  });

  it("correctly creates object if it is core values are edited", () => {
    const createdObject: ComposerServiceOrderItem = {
      ...testApiInstance,
      action: "update",
    };
    const createdEmbedded: ComposerServiceOrderItem[] = [
      ...testEmbeddedApiInstances,
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
      createdObject,
      createdEmbedded,
      testApiInstanceModel,
    );

    expect(result).toMatchObject(expectedResult);

    const createdEmbedded2: ComposerServiceOrderItem[] =
      testEmbeddedApiInstances.map((instance) => {
        return { ...instance, action: "update" };
      });
    const result2 = shapesDataTransform(
      createdObject,
      createdEmbedded2,

      testApiInstanceModel,
    );

    expect(result2).toMatchObject(expectedResult);

    const createdEmbedded3: ComposerServiceOrderItem[] = [
      { ...testEmbeddedApiInstances[0], action: null },
      { ...testEmbeddedApiInstances[1], action: "create" },
    ];
    const result3 = shapesDataTransform(
      createdObject,
      createdEmbedded3,
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
      interServiceRelations[0],
      interServiceRelations,
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
      interServiceRelations[1],
      interServiceRelations,
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

//Mocks necessary to have jointJS library working for following tests
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
  const serviceA = createComposerEntity({
    serviceModel: Service.a,
    isCore: false,
    isInEditMode: false,
    attributes: InstanceAttributesA,
  });

  it("WHEN one element has rule describing other THEN return true", () => {
    const rules = createConnectionRules([Service.a], {});
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    const embeddedService = createComposerEntity({
      serviceModel: Service.a.embedded_entities[0],
      isCore: false,
      isInEditMode: false,
      attributes: (
        InstanceAttributesA["circuits"] as InstanceAttributeModel[]
      )[0],
      isEmbedded: true,
    });

    graph.addCells([serviceA, embeddedService]);

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(embeddedService),
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

    const independendService = createComposerEntity({
      serviceModel: Service.b,
      isCore: false,
      isInEditMode: false,
      attributes: InstanceAttributesB,
    });

    graph.addCells([serviceA, independendService]);

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(independendService),
      rules,
    );

    expect(result).toBeFalsy();
  });

  it("WHEN one element has rule describing other, and the other is blocked from editing THEN return true", () => {
    const rules = createConnectionRules([Service.a], {});
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    const blockedService = createComposerEntity({
      serviceModel: Service.a.embedded_entities[0],
      isCore: false,
      isInEditMode: false,
      attributes: (
        InstanceAttributesA["circuits"] as InstanceAttributeModel[]
      )[0],
      isBlockedFromEditing: true,
    });

    graph.addCells([serviceA, blockedService]);

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(blockedService),
      rules,
    );

    expect(result).toBeTruthy();
  });

  it("WHEN one element has rule describing other, but is blocked from editing THEN return false", () => {
    const rules = createConnectionRules([Service.a], {});
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    serviceA.set("isBlockedFromEditing", true);

    const serviceB = createComposerEntity({
      serviceModel: Service.a.embedded_entities[0],
      isCore: false,
      isInEditMode: false,
      attributes: (
        InstanceAttributesA["circuits"] as InstanceAttributeModel[]
      )[0],
      isEmbedded: true,
      holderName: Service.a.name,
    });

    graph.addCells([serviceA, serviceB]);

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(serviceB),
      rules,
    );

    expect(result).toBeFalsy();

    //set back to default
    serviceA.set("isBlockedFromEditing", false);
  });

  it("WHEN one element has rule describing other, but the other is and embedded entity already connected to parent THEN return false", () => {
    const rules = createConnectionRules([Service.a], {});
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    const connectedCoreEntity = createComposerEntity({
      serviceModel: Service.a,
      isCore: true,
      isInEditMode: false,
      attributes: InstanceAttributesA,
    });

    const connectedEmbeddedEntity = createComposerEntity({
      serviceModel: Service.a.embedded_entities[0],
      isCore: true,
      isInEditMode: false,
      attributes: (
        InstanceAttributesA["circuits"] as InstanceAttributeModel[]
      )[0],
      isEmbedded: true,
      holderName: "service_name_a",
    });

    graph.addCells([serviceA, connectedCoreEntity, connectedEmbeddedEntity]);

    const link = new Link();

    link.source(connectedCoreEntity);
    link.target(connectedEmbeddedEntity);
    link.addTo(graph);

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(connectedEmbeddedEntity),
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
    const serviceOrderItems = getServiceOrderItems(
      map,
      services as unknown as ServiceModel[],
    );

    const createdCopy = JSON.parse(JSON.stringify(createdInstance));
    const updatedCopy = JSON.parse(JSON.stringify(updatedInstance));
    const deletedCopy = JSON.parse(JSON.stringify(deletedInstance));

    delete createdCopy.relatedTo;
    delete updatedCopy.relatedTo;
    delete deletedCopy.relatedTo;
    expect(serviceOrderItems).toEqual([createdCopy, updatedCopy, deletedCopy]);
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
    const serviceOrderItems = getServiceOrderItems(
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
    expect(serviceOrderItems).toEqual([
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
    const serviceOrderItems = getServiceOrderItems(
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
    expect(serviceOrderItems).toEqual([coreCopy]);
  });
});

describe("updateLabelPosition", () => {
  Object.defineProperty(global.SVGElement.prototype, "getBBox", {
    writable: true,
    value: jest.fn().mockReturnValue({
      x: 0,
      y: 0,
      width: 50,
      height: 50,
    }),
  });

  /**
   * Function that creates graph, paper, two entities which are then manually placed into passed coordinates and connected by link to align with real life scenarios
   * @param {number} sourceX X coordinate for source cell
   * @param {number} sourceY Y coordinate for source cell
   * @param {number} sourceAnchorX X coordinate for source cell anchor for the link
   * @param {number} targetX X coordinate for target cell
   * @param {number} targetY Y coordinate for target cell
   * @param {number} targetAnchorX X coordinate for target cell anchor for the link
   * @returns {LabelLinkView} LinkView
   */
  const setup = (
    sourceX: number,
    sourceY: number,
    sourceAnchorX: number,
    targetX: number,
    targetY: number,
    targetAnchorX: number,
  ) => {
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    const sourceService = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbedded: false,
      isInEditMode: false,
      attributes: InstanceAttributesA,
    });
    const targetService = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbedded: false,
      isInEditMode: false,
      attributes: InstanceAttributesB,
    });

    graph.addCell(sourceService);
    graph.addCell(targetService);

    sourceService.set("position", { x: sourceX, y: sourceY });
    targetService.set("position", { x: targetX, y: targetY });

    const connection = new Link();

    connection.source(sourceService, {
      anchor: {
        name: "center",
        args: { dx: sourceAnchorX, dy: sourceY + 25 },
      },
    });
    connection.target(targetService, {
      anchor: {
        name: "center",
        args: { dx: targetAnchorX, dy: targetY + 25 },
      },
    });

    graph.addCell(connection);

    const linkView = paper.findViewByModel(connection) as LabelLinkView;

    linkView.model.appendLabel({
      attrs: {
        rect: {
          fill: "none",
        },
        text: {
          text: sourceService.getName(),
          autoOrient: "target",
          class: "joint-label-text",
        },
      },
      position: {
        distance: 1,
      },
    });
    linkView.model.appendLabel({
      attrs: {
        rect: {
          fill: "none",
        },
        text: {
          text: targetService.getName(),
          autoOrient: "source",
          class: "joint-label-text",
        },
      },
      position: {
        distance: 0,
      },
    });

    return linkView;
  };

  it.each`
    sourceX | sourceY | sourceAnchorX | targetX | targetY | targetAnchorX | sourceResult                              | targetResult
    ${500}  | ${500}  | ${500}        | ${0}    | ${0}    | ${264}        | ${{ textAnchor: "end", x: -15, y: 15 }}   | ${{ textAnchor: "start", x: 15, y: -15 }}
    ${0}    | ${0}    | ${264}        | ${500}  | ${500}  | ${500}        | ${{ textAnchor: "start", x: 15, y: -15 }} | ${{ textAnchor: "end", x: -15, y: 15 }}
    ${500}  | ${0}    | ${500}        | ${0}    | ${500}  | ${264}        | ${{ textAnchor: "end", x: -15, y: -15 }}  | ${{ textAnchor: "start", x: 15, y: 15 }}
    ${0}    | ${500}  | ${264}        | ${500}  | ${0}    | ${500}        | ${{ textAnchor: "start", x: 15, y: 15 }}  | ${{ textAnchor: "end", x: -15, y: -15 }}
    ${0}    | ${0}    | ${0}          | ${0}    | ${500}  | ${0}          | ${{ textAnchor: "end", x: -15, y: -15 }}  | ${{ textAnchor: "end", x: -15, y: 15 }}
    ${0}    | ${500}  | ${0}          | ${0}    | ${0}    | ${0}          | ${{ textAnchor: "end", x: -15, y: 15 }}   | ${{ textAnchor: "end", x: -15, y: -15 }}
  `(
    "return adequate position of the link label depending on coordinates of the source and target",
    ({
      sourceX,
      sourceY,
      sourceAnchorX,
      targetX,
      targetY,
      targetAnchorX,
      sourceResult,
      targetResult,
    }) => {
      const linkView = setup(
        sourceX,
        sourceY,
        sourceAnchorX,
        targetX,
        targetY,
        targetAnchorX,
      );
      const labelCloseToTarget = linkView.findLabelNode(0) as SVGSVGElement;
      const labelCloseToSource = linkView.findLabelNode(1) as SVGSVGElement;

      const result2 = updateLabelPosition(
        "source",
        linkView.getBBox(),
        labelCloseToSource,
        {},
        linkView,
      );

      expect(result2).toEqual(sourceResult);

      const result = updateLabelPosition(
        "target",
        linkView.getBBox(),
        labelCloseToTarget,
        {},
        linkView,
      );

      expect(result).toEqual(targetResult);
    },
  );
});

describe("toggleLooseElement", () => {
  it("dispatch a proper event with id when called", () => {
    const dispatchEventSpy = jest.spyOn(document, "dispatchEvent");

    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    //add highlighter
    const entity = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbedded: false,
      isInEditMode: false,
      attributes: InstanceAttributesA,
    });

    graph.addCell(entity);

    toggleLooseElement(paper.findViewByModel(entity), EventActionEnum.ADD);

    //assert the arguments of the first call - calls is array of the arguments of each call
    expect((dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail).toEqual(
      JSON.stringify({ kind: "add", id: entity.id }),
    );
    expect(
      dia.HighlighterView.get(paper.findViewByModel(entity), "loose_element"),
    ).not.toBeNull();

    //remove
    toggleLooseElement(paper.findViewByModel(entity), EventActionEnum.REMOVE);
    expect(
      dia.HighlighterView.get(paper.findViewByModel(entity), "loose_element"),
    ).toBeNull();

    //assert the arguments of the second call
    expect((dispatchEventSpy.mock.calls[1][0] as CustomEvent).detail).toEqual(
      JSON.stringify({ kind: "remove", id: entity.id }),
    );
  });

  it("appends and removes a highlighted object from an entity", () => {
    const graph = new dia.Graph();
    const paper = new dia.Paper({
      model: graph,
    });

    const entity = createComposerEntity({
      serviceModel: Service.a,
      isCore: false,
      isEmbedded: false,
      isInEditMode: false,
      attributes: InstanceAttributesA,
    });

    graph.addCell(entity);

    toggleLooseElement(paper.findViewByModel(entity), EventActionEnum.ADD);
    expect(
      dia.HighlighterView.get(paper.findViewByModel(entity), "loose_element"),
    ).not.toBeNull();

    toggleLooseElement(paper.findViewByModel(entity), EventActionEnum.REMOVE);
    expect(
      dia.HighlighterView.get(paper.findViewByModel(entity), "loose_element"),
    ).toBeNull();
  });
});

describe("findInterServiceRelations", () => {
  it("it returns empty array WHEN service doesn't have inter-service relations", () => {
    const result = findInterServiceRelations(parentModel);

    expect(result).toEqual([]);
  });

  it("it returns related service names WHEN service have direct inter-service relations", () => {
    const result = findInterServiceRelations(childModel);

    expect(result).toEqual(["parent-service"]);
  });

  it("it returns related service names WHEN service have inter-service relations in embedded entities", () => {
    const result = findInterServiceRelations(containerModel);

    expect(result).toEqual(["parent-service"]);
  });
});

describe("findIFullInterServiceRelations", () => {
  it("it returns empty array WHEN service doesn't have inter-service relations", () => {
    const result = findFullInterServiceRelations(parentModel);

    expect(result).toEqual([]);
  });

  it("it returns related service names WHEN service have direct inter-service relations", () => {
    const result = findFullInterServiceRelations(childModel);

    expect(result).toEqual([
      {
        description: "",
        entity_type: "parent-service",
        lower_limit: 1,
        modifier: "rw+",
        name: "parent_entity",
        upper_limit: 1,
      },
    ]);
  });

  it("it returns related service names WHEN service have inter-service relations in embedded entities", () => {
    const result = findFullInterServiceRelations(containerModel);

    expect(result).toEqual([
      {
        description: "",
        entity_type: "parent-service",
        lower_limit: 1,
        modifier: "rw+",
        name: "parent_entity",
        upper_limit: 1,
      },
    ]);
  });
});

describe("showLinkTools", () => {
  const setup = (
    isParentInEditMode: boolean,
    isChildInEditMode: boolean,
    modifier: "rw+" | "rw",
  ) => {
    const editable = true;
    const graph = new dia.Graph({});
    const connectionRules = createConnectionRules(
      [parentModel, childModel],
      {},
    );
    const paper = new ComposerPaper(connectionRules, graph, editable).paper;

    connectionRules[childModel.name][0].modifier = modifier;

    const parentEntity = createComposerEntity({
      serviceModel: parentModel,
      isCore: false,
      isInEditMode: isParentInEditMode,
    });
    const childEntity = createComposerEntity({
      serviceModel: childModel,
      isCore: false,
      isInEditMode: isChildInEditMode,
      isEmbedded: true,
    });

    graph.addCell(parentEntity);
    graph.addCell(childEntity);

    const link = new Link();

    link.source(parentEntity);
    link.target(childEntity);

    graph.addCell(link);
    const linkView = paper.findViewByModel(link) as dia.LinkView;

    return { paper, graph, linkView, connectionRules };
  };

  it("adds tools to the link when instances aren't in EditMode and there is no rule with rw modifier", () => {
    const isParentInEditMode = false;
    const isChildInEditMode = false;
    const modifier = "rw+";
    const { paper, graph, linkView, connectionRules } = setup(
      isParentInEditMode,
      isChildInEditMode,
      modifier,
    );

    expect(linkView.hasTools()).toBeFalsy();

    showLinkTools(paper, graph, linkView, connectionRules);

    expect(linkView.hasTools()).toBeTruthy();
  });

  it("adds tools to the link when only instance without rule is in edit mode", () => {
    const isParentInEditMode = true;
    const isChildInEditMode = false;
    const modifier = "rw";
    const { paper, graph, linkView, connectionRules } = setup(
      isParentInEditMode,
      isChildInEditMode,
      modifier,
    );

    expect(linkView.hasTools()).toBeFalsy();

    showLinkTools(paper, graph, linkView, connectionRules);

    expect(linkView.hasTools()).toBeTruthy();
  });

  it("doesn't add tools to the link when instance with rw rule is in edit mode", () => {
    const isParentInEditMode = false;
    const isChildInEditMode = true;
    const modifier = "rw";
    const { paper, graph, linkView, connectionRules } = setup(
      isParentInEditMode,
      isChildInEditMode,
      modifier,
    );

    expect(linkView.hasTools()).toBeFalsy();

    showLinkTools(paper, graph, linkView, connectionRules);
    expect(linkView.hasTools()).toBeFalsy();
  });
});
