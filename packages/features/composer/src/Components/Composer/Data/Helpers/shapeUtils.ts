import { EmbeddedEntity, InterServiceRelation } from "@inmanta/web-console-core";
import { SHAPE_WIDTH, SHAPE_MIN_HEIGHT } from "../../config/shapeConfig";
import type { ServiceEntityShape } from "../ServiceEntityShape";

/**
 * Gets the size of a shape with fallback to default dimensions.
 * The canvas stores the measured size on the shape once it has rendered the card;
 * before that, the defaults apply.
 *
 * @param shape - The shape to get dimensions from
 * @returns Object with width and height, using defaults if the size is unknown
 */
export const getShapeDimensions = (
  shape: Pick<ServiceEntityShape, "size">,
  defaultWidth: number = SHAPE_WIDTH,
  defaultHeight: number = SHAPE_MIN_HEIGHT
): { width: number; height: number } => {
  const { width, height } = shape.size ?? { width: 0, height: 0 };

  return {
    width: width > 0 ? width : defaultWidth,
    height: height > 0 ? height : defaultHeight,
  };
};

/**
 * Gets the connection key for an embedded entity.
 * Uses the same logic as when storing connections: entity.type || entity.name
 *
 * @param entity - The embedded entity
 * @returns The connection key string
 */
export const getEmbeddedEntityKey = (entity: EmbeddedEntity): string => {
  return entity.type || entity.name;
};

/**
 * Gets the connection key for an inter-service relation.
 * Uses the same logic as when storing connections: relation.entity_type || relation.name
 *
 * @param relation - The inter-service relation
 * @returns The connection key string
 */
export const getInterServiceRelationKey = (relation: InterServiceRelation): string => {
  return relation.entity_type || relation.name;
};

/**
 * Converts a lower_limit value (which can be bigint, number, null, or undefined) to a number.
 * This pattern is used in multiple places for connection validation.
 *
 * @param lowerLimit - The lower limit value to convert
 * @returns The numeric value, or 0 if null/undefined
 */
export const convertLowerLimitToNumber = (
  lowerLimit: bigint | number | null | undefined
): number => {
  if (typeof lowerLimit === "bigint") {
    return Number(lowerLimit);
  }

  return lowerLimit ?? 0;
};
