import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, InterServiceRelation } from "@/Core";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { SHAPE_WIDTH, SHAPE_MIN_HEIGHT } from "../../config/shapeConfig";

/**
 * Default shape dimensions used throughout the composer
 * Re-exported from config for backward compatibility
 */
export { SHAPE_WIDTH, SHAPE_MIN_HEIGHT };

/**
 * Gets the bounding box of a shape with fallback to default dimensions.
 * This pattern is used in multiple places to safely get shape dimensions.
 *
 * @param shape - The shape to get dimensions from
 * @returns Object with width and height, using defaults if bbox is unavailable
 */
export const getShapeDimensions = (
  shape: ServiceEntityShape | dia.Element,
  defaultWidth: number = SHAPE_WIDTH,
  defaultHeight: number = SHAPE_MIN_HEIGHT
): { width: number; height: number } => {
  let width = defaultWidth;
  let height = defaultHeight;

  try {
    const boundingBox = shape.getBBox();
    if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
      width = boundingBox.width;
      height = boundingBox.height;
    }
  } catch {
    // Fallback to default dimensions if bounding box is not available
  }

  return { width, height };
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
