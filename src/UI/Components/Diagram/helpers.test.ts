import { InstanceAttributeModel } from "@/Core";
import { Service, ServiceInstance } from "@/Test";
import { createConnectionRules, extractRelationsIds } from "./helpers";

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
          upperLimit: 1,
        },
        {
          name: "customer_endpoint",
          upperLimit: 1,
        },
        {
          name: "csp_endpoint",
          upperLimit: 1,
        },
      ],
      csp_endpoint: [
        {
          name: "allocated",
          upperLimit: 1,
        },
      ],
      customer_endpoint: [
        {
          name: "allocated",
          upperLimit: 1,
        },
      ],
      service_name_a: [
        {
          name: "circuits",
          upperLimit: 4,
        },
      ],
      with_relations: [
        {
          name: "test_entity",
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
          upperLimit: 1,
        },
      ],
      another_embedded_single: [
        {
          name: "test_entity",
          upperLimit: null,
        },
      ],
      editable_embedded_entity_relation_with_rw_attributes: [],
      embedded: [
        {
          name: "embedded_single",
          upperLimit: 1,
        },
      ],
      embedded_single: [],
      not_editable: [],
      test_service: [
        {
          name: "embedded",
          upperLimit: 2,
        },
        {
          name: "another_embedded",
          upperLimit: null,
        },
        {
          name: "not_editable",
          upperLimit: 1,
        },
        {
          name: "editable_embedded_entity_relation_with_rw_attributes",
          upperLimit: 4,
        },
        {
          name: "subnet",
          upperLimit: null,
        },
      ],
    });
  });
});
