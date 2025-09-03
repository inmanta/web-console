import { dia } from "@inmanta/rappid";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
import { Service } from "@/Test";
import {
  a as InstanceAttributesA,
  b as InstanceAttributesB,
} from "@/Test/Data/ServiceInstance/Attributes";
import {
  ConnectionRules,
  EmbeddedRule,
  InterServiceRule,
  TypeEnum,
} from "@/UI/Components/Diagram/interfaces";
import { createComposerEntity } from "../Actions/general";
import { Link, ServiceEntityBlock } from "../Shapes/Link";
import { defineObjectsForJointJS } from "../testSetup";
import {
  createConnectionRules,
  checkWhetherConnectionRulesAreExhausted,
  checkIfConnectionIsAllowed,
} from "./connections";

defineObjectsForJointJS();

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
    ({ services, expectedRules }: { services: ServiceModel[]; expectedRules: ConnectionRules }) => {
      const rules = createConnectionRules(services, {});

      expect(rules).toStrictEqual(expectedRules);
    }
  );
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
    expect(checkWhetherConnectionRulesAreExhausted([], embeddedRule, true)).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedEmbedded], embeddedRule, true)
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedMatchingEmbedded], embeddedRule, true)
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        embeddedRule,
        true
      )
    ).toBeTruthy();

    expect(checkWhetherConnectionRulesAreExhausted([], relationRule, true)).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedInterService], relationRule, true)
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedMatchingInterService], relationRule, true)
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        relationRule,
        true
      )
    ).toBeTruthy();

    //editMode set to false
    expect(checkWhetherConnectionRulesAreExhausted([], embeddedRule, false)).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedEmbedded], embeddedRule, false)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedMatchingEmbedded], embeddedRule, false)
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        embeddedRule,
        false
      )
    ).toBeTruthy();

    expect(checkWhetherConnectionRulesAreExhausted([], relationRule, false)).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedInterService], relationRule, false)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedMatchingInterService], relationRule, false)
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        relationRule,
        false
      )
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
    expect(checkWhetherConnectionRulesAreExhausted([], rwEmbeddedRule, true)).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedEmbedded], rwEmbeddedRule, true)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedMatchingEmbedded], rwEmbeddedRule, true)
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        rwEmbeddedRule,
        true
      )
    ).toBeTruthy();

    expect(checkWhetherConnectionRulesAreExhausted([], rwRelationRule, true)).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedInterService], rwRelationRule, true)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedMatchingInterService], rwRelationRule, true)
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        rwRelationRule,
        true
      )
    ).toBeTruthy();

    //editMode set to false
    expect(checkWhetherConnectionRulesAreExhausted([], rwEmbeddedRule, false)).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedEmbedded], rwEmbeddedRule, false)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedMatchingEmbedded], rwEmbeddedRule, false)
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        rwEmbeddedRule,
        false
      )
    ).toBeTruthy();

    expect(checkWhetherConnectionRulesAreExhausted([], rwRelationRule, false)).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedInterService], rwRelationRule, false)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedMatchingInterService], rwRelationRule, false)
    ).toBeTruthy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        rwRelationRule,
        false
      )
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
      checkWhetherConnectionRulesAreExhausted([], EmbeddedRuleUndefinedLimit, false)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedEmbedded], EmbeddedRuleUndefinedLimit, false)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded],
        EmbeddedRuleUndefinedLimit,
        false
      )
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        EmbeddedRuleUndefinedLimit,
        false
      )
    ).toBeFalsy();

    expect(
      checkWhetherConnectionRulesAreExhausted([], RelationRuleUndefinedLimit, false)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedInterService],
        RelationRuleUndefinedLimit,
        false
      )
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService],
        RelationRuleUndefinedLimit,
        false
      )
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        RelationRuleUndefinedLimit,
        false
      )
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
    expect(checkWhetherConnectionRulesAreExhausted([], EmbeddedRuleNoLimit, false)).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedEmbedded], EmbeddedRuleNoLimit, false)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedMatchingEmbedded], EmbeddedRuleNoLimit, false)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingEmbedded, mockedEmbedded],
        EmbeddedRuleNoLimit,
        false
      )
    ).toBeFalsy();

    expect(checkWhetherConnectionRulesAreExhausted([], RelationRuleNoLimit, false)).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted([mockedInterService], RelationRuleNoLimit, false)
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService],
        RelationRuleNoLimit,
        false
      )
    ).toBeFalsy();
    expect(
      checkWhetherConnectionRulesAreExhausted(
        [mockedMatchingInterService, mockedInterService],
        RelationRuleNoLimit,
        false
      )
    ).toBeFalsy();
  });
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
      attributes: (InstanceAttributesA["circuits"] as InstanceAttributeModel[])[0],
      isEmbeddedEntity: true,
    });

    graph.addCells([serviceA, embeddedService]);

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(embeddedService),
      rules
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
      rules
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
      attributes: (InstanceAttributesA["circuits"] as InstanceAttributeModel[])[0],
      isBlockedFromEditing: true,
    });

    graph.addCells([serviceA, blockedService]);

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(blockedService),
      rules
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
      attributes: (InstanceAttributesA["circuits"] as InstanceAttributeModel[])[0],
      isEmbeddedEntity: true,
      holderName: Service.a.name,
    });

    graph.addCells([serviceA, serviceB]);

    const result = checkIfConnectionIsAllowed(
      graph,
      paper.findViewByModel(serviceA),
      paper.findViewByModel(serviceB),
      rules
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
      attributes: (InstanceAttributesA["circuits"] as InstanceAttributeModel[])[0],
      isEmbeddedEntity: true,
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
      rules
    );

    expect(result).toBeFalsy();
  });
});
