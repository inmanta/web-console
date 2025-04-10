import { InstanceAttributeModel, ServiceInstanceModelWithTargetStates, ServiceModel } from "@/Core";
import { Service, ServiceInstance } from "@/Test";
import { childModel, containerModel, parentModel } from "../Mocks";
import { ServiceEntityBlock } from "../shapes";
import {
  extractRelationsIds,
  findCorrespondingId,
  findFullInterServiceRelations,
  findInterServiceRelations,
} from "./relations";

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
    }
  );

  it("Service With relations in active and candidate sets gives an array with candidate attributes first", () => {
    const ids = extractRelationsIds(Service.withRelationsOnly, ServiceInstance.with_relations);

    const expectedId = (
      ServiceInstance.with_relations.candidate_attributes as InstanceAttributeModel
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

    const expectedId = (ServiceInstance.with_relations.active_attributes as InstanceAttributeModel)[
      "test_entity"
    ] as string;

    expect(ids).toHaveLength(1);
    expect(ids[0]).toBe(expectedId);
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

describe("findCorrespondingId", () => {
  const mockedInstance = {
    id: "1245",
  } as ServiceEntityBlock;

  it("return undefined on empty Map", () => {
    expect(findCorrespondingId(new Map(), mockedInstance)).toBeUndefined();
  });

  it("return undefined on Map without corresponding instance id", () => {
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
