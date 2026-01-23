import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, InterServiceRelation } from "@/Core";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import {
  getShapeDimensions,
  getEmbeddedEntityKey,
  getInterServiceRelationKey,
  convertLowerLimitToNumber,
  SHAPE_WIDTH,
  SHAPE_MIN_HEIGHT,
} from "./shapeUtils";

describe("shapeUtils", () => {
  describe("getShapeDimensions", () => {
    it("should return default dimensions when bbox is unavailable", () => {
      const mockShape = {
        getBBox: vi.fn().mockImplementation(() => {
          throw new Error("BBox not available");
        }),
      } as unknown as ServiceEntityShape;

      const result = getShapeDimensions(mockShape);

      expect(result.width).toBe(SHAPE_WIDTH);
      expect(result.height).toBe(SHAPE_MIN_HEIGHT);
    });

    it("should return default dimensions when bbox has zero dimensions", () => {
      const mockShape = {
        getBBox: vi.fn().mockReturnValue({ width: 0, height: 0 }),
      } as unknown as ServiceEntityShape;

      const result = getShapeDimensions(mockShape);

      expect(result.width).toBe(SHAPE_WIDTH);
      expect(result.height).toBe(SHAPE_MIN_HEIGHT);
    });

    it("should return bbox dimensions when available", () => {
      const mockShape = {
        getBBox: vi.fn().mockReturnValue({ width: 300, height: 150 }),
      } as unknown as ServiceEntityShape;

      const result = getShapeDimensions(mockShape);

      expect(result.width).toBe(300);
      expect(result.height).toBe(150);
    });

    it("should use custom default dimensions when provided", () => {
      const mockShape = {
        getBBox: vi.fn().mockImplementation(() => {
          throw new Error("BBox not available");
        }),
      } as unknown as ServiceEntityShape;

      const result = getShapeDimensions(mockShape, 200, 100);

      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });

    it("should work with dia.Element", () => {
      const mockElement = {
        getBBox: vi.fn().mockReturnValue({ width: 250, height: 120 }),
      } as unknown as dia.Element;

      const result = getShapeDimensions(mockElement);

      expect(result.width).toBe(250);
      expect(result.height).toBe(120);
    });
  });

  describe("getEmbeddedEntityKey", () => {
    it("should return type when available", () => {
      const entity: EmbeddedEntity = {
        name: "endpoint",
        type: "Endpoint",
        lower_limit: 1,
        upper_limit: 1,
        modifier: "rw",
        attributes: [],
        embedded_entities: [],
        inter_service_relations: [],
      };

      expect(getEmbeddedEntityKey(entity)).toBe("Endpoint");
    });

    it("should return name when type is not available", () => {
      const entity: EmbeddedEntity = {
        name: "endpoint",
        type: "Endpoint",
        lower_limit: 1,
        upper_limit: 1,
        modifier: "rw",
        attributes: [],
        embedded_entities: [],
        inter_service_relations: [],
      };

      expect(getEmbeddedEntityKey(entity)).toBe("endpoint");
    });

    it("should prefer type over name", () => {
      const entity: EmbeddedEntity = {
        name: "endpoint",
        type: "Endpoint",
        lower_limit: 1,
        upper_limit: 1,
        modifier: "rw",
        attributes: [],
        embedded_entities: [],
        inter_service_relations: [],
      };

      expect(getEmbeddedEntityKey(entity)).toBe("Endpoint");
    });
  });

  describe("getInterServiceRelationKey", () => {
    it("should return entity_type when available", () => {
      const relation: InterServiceRelation = {
        name: "uni",
        entity_type: "UserNetworkInterface",
        lower_limit: 1,
        upper_limit: 1,
        modifier: "rw",
      };

      expect(getInterServiceRelationKey(relation)).toBe("UserNetworkInterface");
    });

    it("should return name when entity_type is not available", () => {
      const relation: InterServiceRelation = {
        name: "ServiceB",
        entity_type: "UserNetworkInterface",
        lower_limit: 1,
        upper_limit: 1,
        modifier: "rw",
      };

      expect(getInterServiceRelationKey(relation)).toBe("ServiceB");
    });

    it("should prefer entity_type over name", () => {
      const relation: InterServiceRelation = {
        name: "uni",
        entity_type: "UserNetworkInterface",
        lower_limit: 1,
        upper_limit: 1,
        modifier: "rw",
      };

      expect(getInterServiceRelationKey(relation)).toBe("UserNetworkInterface");
    });
  });

  describe("convertLowerLimitToNumber", () => {
    it("should convert bigint to number", () => {
      expect(convertLowerLimitToNumber(BigInt(5))).toBe(5);
      expect(convertLowerLimitToNumber(BigInt(0))).toBe(0);
      expect(convertLowerLimitToNumber(BigInt(100))).toBe(100);
    });

    it("should return number as-is", () => {
      expect(convertLowerLimitToNumber(5)).toBe(5);
      expect(convertLowerLimitToNumber(0)).toBe(0);
      expect(convertLowerLimitToNumber(100)).toBe(100);
    });

    it("should return 0 for null", () => {
      expect(convertLowerLimitToNumber(null)).toBe(0);
    });

    it("should return 0 for undefined", () => {
      expect(convertLowerLimitToNumber(undefined)).toBe(0);
    });
  });
});
