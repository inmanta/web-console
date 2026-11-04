import { EmbeddedEntity, InterServiceRelation, ServiceModel } from "@inmanta/web-console-core";
import { SHAPE_WIDTH, SHAPE_MIN_HEIGHT, SHAPE_HEADER_HEIGHT, SHAPE_ROW_HEIGHT } from "../../config";
import { ServiceEntityShape } from "../ServiceEntityShape";
import {
  getShapeDimensions,
  getEmbeddedEntityKey,
  getInterServiceRelationKey,
  convertLowerLimitToNumber,
} from "./shapeUtils";

describe("shapeUtils", () => {
  describe("getShapeDimensions", () => {
    it("should return default dimensions when the size is unknown", () => {
      const shape = { size: undefined } as unknown as Pick<ServiceEntityShape, "size">;

      const result = getShapeDimensions(shape);

      expect(result.width).toBe(SHAPE_WIDTH);
      expect(result.height).toBe(SHAPE_MIN_HEIGHT);
    });

    it("should return default dimensions when the size has zero dimensions", () => {
      const result = getShapeDimensions({ size: { width: 0, height: 0 } });

      expect(result.width).toBe(SHAPE_WIDTH);
      expect(result.height).toBe(SHAPE_MIN_HEIGHT);
    });

    it("should return the size when available", () => {
      const result = getShapeDimensions({ size: { width: 300, height: 150 } });

      expect(result.width).toBe(300);
      expect(result.height).toBe(150);
    });

    it("should use custom default dimensions when provided", () => {
      const result = getShapeDimensions({ size: { width: 0, height: 0 } }, 200, 100);

      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
    });

    it("should read the size of a ServiceEntityShape", () => {
      const serviceModel: ServiceModel = {
        name: "ServiceA",
        environment: "test",
        lifecycle: { initial_state: "active", states: [], transfers: [] },
        attributes: [],
        config: {},
        embedded_entities: [],
        inter_service_relations: [],
        owned_entities: [],
        owner: null,
        key_attributes: ["name", "port"],
      };
      const shape = new ServiceEntityShape({
        id: "shape-1",
        entityType: "core",
        serviceModel,
        instanceAttributes: {},
        readonly: false,
        isNew: true,
        lockedOnCanvas: false,
        relationsDictionary: {},
        rootEntities: {},
        interServiceRelations: {},
        embeddedEntities: {},
      });

      // Before the canvas measured the card, the size is estimated from the key attributes
      expect(getShapeDimensions(shape)).toEqual({
        width: SHAPE_WIDTH,
        height: SHAPE_HEADER_HEIGHT + 2 * SHAPE_ROW_HEIGHT,
      });

      shape.size = { width: 250, height: 120 };

      expect(getShapeDimensions(shape)).toEqual({ width: 250, height: 120 });
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

      expect(getEmbeddedEntityKey(entity)).toBe("Endpoint");
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

      expect(getInterServiceRelationKey(relation)).toBe("UserNetworkInterface");
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
