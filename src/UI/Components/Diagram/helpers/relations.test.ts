import { childModel, containerModel, parentModel } from "../Mocks";
import { ServiceEntityBlock } from "../Shapes/Link";
import {
  findCorrespondingId,
  findFullInterServiceRelations,
  findInterServiceRelations,
} from "./relations";

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
