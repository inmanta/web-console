import { v4 as uuidv4 } from "uuid";
import { ServiceModel, ServiceInstanceModel, EmbeddedEntity } from "@inmanta/web-console-core";
import { InstanceWithRelations } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { SHAPE_WIDTH, SHAPE_MIN_HEIGHT } from "../../config";
import {
  HORIZONTAL_SPACING,
  VERTICAL_SPACING,
  NESTED_HORIZONTAL_OFFSET,
} from "../../config/layoutConfig";
import { ServiceEntityShape, ServiceEntityOptions } from "../ServiceEntityShape";
import { applyLayeredLayout } from "./canvasLayoutUtils";
import { RelationsDictionary } from "./createRelationsDictionary";
import { PositionTracker } from "./positionTracker";
import { getShapeDimensions, getEmbeddedEntityKey, getInterServiceRelationKey } from "./shapeUtils";

/**
 * Adds a relation id to the given collection map, avoiding duplicates.
 */
const addRelationId = (collection: Record<string, string[]>, key: string, value: string) => {
  if (!collection[key]) {
    collection[key] = [];
  }

  if (!collection[key].includes(value)) {
    collection[key].push(value);
  }
};

const candidateKeyFields = ["identifier", "id", "name"];

/**
 * Builds a cache key for an embedded entity instance based on key attributes.
 */
const getEmbeddedEntityCacheKey = (
  rootEntityId: string,
  embeddedEntity: EmbeddedEntity,
  embeddedAttributes: Record<string, unknown>
): string | undefined => {
  const preferredKeys =
    embeddedEntity.key_attributes && embeddedEntity.key_attributes.length > 0
      ? embeddedEntity.key_attributes
      : candidateKeyFields;

  const keyValues: string[] = [];

  preferredKeys.forEach((key) => {
    const value = embeddedAttributes[key];
    if (
      value !== undefined &&
      value !== null &&
      (typeof value === "string" || typeof value === "number")
    ) {
      keyValues.push(String(value));
    }
  });

  if (keyValues.length === 0) {
    return undefined;
  }

  return `${rootEntityId}:${embeddedEntity.name}:${keyValues.join("|")}`;
};

/**
 * Creates (or reuses) shapes for an embedded entity and its nested embedded entities.
 * Returns the ids of all created or reused shapes.
 */
export const createEmbeddedEntityShapes = (
  embeddedEntity: EmbeddedEntity,
  embeddedData: unknown,
  parentShape: ServiceEntityShape,
  rootEntityId: string,
  relationsDictionary: RelationsDictionary,
  canvasState: Map<string, ServiceEntityShape>,
  embeddedEntityCache: Map<string, string>,
  positionTracker: PositionTracker,
  offsetX: number,
  offsetY: number,
  isNew: boolean = false
): string[] => {
  const createdIds: string[] = [];
  const dataArray = Array.isArray(embeddedData) ? embeddedData : [embeddedData];

  dataArray.forEach((data, index) => {
    if (typeof data !== "object" || data === null) {
      return;
    }

    const embeddedAttributes = data as Record<string, unknown>;
    // Skip read-only embedded entities
    if (embeddedEntity.modifier === "r") {
      return;
    }

    const cacheKey = getEmbeddedEntityCacheKey(rootEntityId, embeddedEntity, embeddedAttributes);

    if (cacheKey) {
      const cachedId = embeddedEntityCache.get(cacheKey);
      if (cachedId) {
        createdIds.push(cachedId);

        const cachedShape = canvasState.get(cachedId);

        if (cachedShape) {
          const rootConnectionKey = parentShape.serviceModel.name;
          const existingRootConnections = cachedShape.connections.get(rootConnectionKey) || [];

          if (rootEntityId && !existingRootConnections.includes(rootEntityId)) {
            cachedShape.connections.set(rootConnectionKey, [
              ...existingRootConnections,
              rootEntityId,
            ]);
          }

          // If the cached shape already has a position, keep it
          // Otherwise, find a new position for it
          const existingPosition = positionTracker.getPosition(cachedId);
          if (!existingPosition) {
            const parentPos = parentShape.position();
            const newY = positionTracker.findNextYPosition(
              offsetX,
              SHAPE_WIDTH,
              SHAPE_MIN_HEIGHT,
              parentPos.y + index * VERTICAL_SPACING
            );
            cachedShape.position(offsetX, newY);
            const { width: bboxWidth, height: bboxHeight } = getShapeDimensions(cachedShape);
            positionTracker.reserve(cachedId, offsetX, newY, bboxWidth, bboxHeight);
          }
        }

        return;
      }
    }

    const embeddedId = uuidv4();

    const interServiceRelations: Record<string, string[]> = {};
    embeddedEntity.inter_service_relations.forEach((relation) => {
      const relationValue = embeddedAttributes[relation.name];
      const relationKey = getInterServiceRelationKey(relation);

      if (relationValue) {
        if (Array.isArray(relationValue)) {
          relationValue
            .filter((val): val is string => typeof val === "string")
            .forEach((val) => addRelationId(interServiceRelations, relationKey, val));
        } else if (typeof relationValue === "string") {
          addRelationId(interServiceRelations, relationKey, relationValue);
        }
      }
    });

    const nestedEmbeddedEntities: Record<string, string[]> = {};
    embeddedEntity.embedded_entities.forEach((nestedEntity) => {
      const nestedData = embeddedAttributes[nestedEntity.name];
      if (nestedData) {
        const nestedIds = createEmbeddedEntityShapes(
          nestedEntity,
          nestedData,
          parentShape,
          rootEntityId,
          relationsDictionary,
          canvasState,
          embeddedEntityCache,
          positionTracker,
          offsetX + NESTED_HORIZONTAL_OFFSET,
          offsetY,
          isNew
        );

        if (nestedIds.length > 0) {
          const entityKey = getEmbeddedEntityKey(nestedEntity);
          nestedEmbeddedEntities[entityKey] = [
            ...(nestedEmbeddedEntities[entityKey] || []),
            ...nestedIds,
          ];
        }
      }
    });

    const rootEntities: Record<string, string[]> = {};

    if (rootEntityId) {
      rootEntities[parentShape.serviceModel.name] = [rootEntityId];
    }

    const shapeOptions: ServiceEntityOptions = {
      entityType: "embedded",
      readonly: false,
      isNew,
      lockedOnCanvas: false,
      id: embeddedId,
      relationsDictionary,
      serviceModel: embeddedEntity,
      instanceAttributes: embeddedAttributes,
      rootEntities,
      interServiceRelations,
      embeddedEntities: nestedEmbeddedEntities,
    };

    const shape = new ServiceEntityShape(shapeOptions);

    // Find a non-overlapping position for this shape
    const parentPos = parentShape.position();
    const startY = parentPos.y + index * VERTICAL_SPACING;
    const finalY = positionTracker.findNextYPosition(
      offsetX,
      SHAPE_WIDTH,
      SHAPE_MIN_HEIGHT,
      startY
    );

    shape.position(offsetX, finalY);

    // Get the actual bounding box to reserve the correct space
    const { width: bboxWidth, height: bboxHeight } = getShapeDimensions(shape);
    positionTracker.reserve(embeddedId, offsetX, finalY, bboxWidth, bboxHeight);

    canvasState.set(embeddedId, shape);
    if (cacheKey) {
      embeddedEntityCache.set(cacheKey, embeddedId);
    }
    createdIds.push(embeddedId);
  });

  return createdIds;
};

/**
 * Initializes the canvas state from an instance-with-relations payload.
 * Creates shapes and embedded entities, lays them out, and returns the canvas state map.
 * The links follow from the shapes' connections.
 */
export const initializeCanvasFromInstance = (
  instanceData: InstanceWithRelations,
  serviceCatalog: ServiceModel[],
  relationsDictionary: RelationsDictionary
): Map<string, ServiceEntityShape> => {
  const canvasState = new Map<string, ServiceEntityShape>();
  const embeddedEntityCache = new Map<string, string>();
  const positionTracker = new PositionTracker();
  const allInstances: ServiceInstanceModel[] = [
    instanceData.instance,
    ...instanceData.interServiceRelations,
  ];

  allInstances.forEach((instance, index) => {
    const serviceModel = serviceCatalog.find((service) => service.name === instance.service_entity);

    if (!serviceModel) {
      console.warn(`Service model not found for ${instance.service_entity}`);

      return;
    }

    const instanceAttributes = instance.candidate_attributes || instance.active_attributes || {};
    const entityType = index === 0 ? "core" : "relation";

    /**
     * Mark shapes as "new" when they come from a placeholder instance.
     * Placeholder instances created via createPlaceholderInstance() use:
     *   - state: "creating"
     *   - no active_attributes
     *
     * This ensures EntityForm treats the main instance as editable (isNew === true),
     * while existing instances loaded from the backend remain non-new.
     */
    const isNewEntity = instance.state === "creating" && !instance.active_attributes;

    const interServiceRelations: Record<string, string[]> = {};
    const rootEntities: Record<string, string[]> = {};

    serviceModel.inter_service_relations.forEach((relation) => {
      const relationValue = instanceAttributes[relation.name];
      const relationKey = getInterServiceRelationKey(relation);

      if (relationValue) {
        if (Array.isArray(relationValue)) {
          relationValue
            .filter((val): val is string => typeof val === "string")
            .forEach((val) => addRelationId(interServiceRelations, relationKey, val));
        } else if (typeof relationValue === "string") {
          addRelationId(interServiceRelations, relationKey, relationValue);
        }
      }
    });

    const shapeOptions: ServiceEntityOptions = {
      entityType,
      readonly: false,
      isNew: isNewEntity,
      lockedOnCanvas: false,
      id: instance.id,
      relationsDictionary,
      serviceModel,
      instanceAttributes,
      rootEntities,
      interServiceRelations,
      embeddedEntities: {},
    };

    const shape = new ServiceEntityShape(shapeOptions);

    let shapeX: number;
    let shapeY: number;

    if (index === 0) {
      shapeX = 100;
      shapeY = 100;
    } else {
      const angle = (index - 1) * (360 / instanceData.interServiceRelations.length);
      const radius = 300;
      shapeX = 100 + radius * Math.cos((angle * Math.PI) / 180);
      shapeY = 100 + radius * Math.sin((angle * Math.PI) / 180);
    }

    // Ensure the main instance doesn't overlap with existing shapes
    const finalY = positionTracker.findNextYPosition(shapeX, SHAPE_WIDTH, SHAPE_MIN_HEIGHT, shapeY);
    shape.position(shapeX, finalY);

    // Reserve the position for the main instance
    const { width: bboxWidth, height: bboxHeight } = getShapeDimensions(shape);
    positionTracker.reserve(instance.id, shapeX, finalY, bboxWidth, bboxHeight);

    canvasState.set(instance.id, shape);

    const parentPosition = shape.position();

    serviceModel.embedded_entities.forEach((embeddedEntity) => {
      if (embeddedEntity.modifier === "r") {
        return;
      }
      const embeddedData = instanceAttributes[embeddedEntity.name];
      if (embeddedData) {
        const embeddedIds = createEmbeddedEntityShapes(
          embeddedEntity,
          embeddedData,
          shape,
          instance.id,
          relationsDictionary,
          canvasState,
          embeddedEntityCache,
          positionTracker,
          parentPosition.x + HORIZONTAL_SPACING,
          parentPosition.y,
          isNewEntity
        );

        if (embeddedIds.length > 0) {
          const entityKey = getEmbeddedEntityKey(embeddedEntity);
          const existing = shape.connections.get(entityKey) || [];
          shape.connections.set(entityKey, [...existing, ...embeddedIds]);
        }
      }
    });
  });

  applyLayeredLayout(canvasState);

  return canvasState;
};
