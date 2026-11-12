import { EmbeddedEntity, InterServiceRelation, ServiceModel } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { RelationsDictionary, Rules } from "./createRelationsDictionary";

/**
 * Finds the inter-service relations entity types for the given service model or embedded entity.
 *
 * TODO: This recursive function should be adjusted to work with levels, and also cover x-level of nested inter-service relations.
 * https://github.com/inmanta/web-console/issues/6546
 *
 * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity to find inter-service relations for.
 *
 * @returns {string[]} An array of entity types that have inter-service relations with the given service model or embedded entity
 */
export const findInterServiceRelations = (
  serviceModel: ServiceModel | EmbeddedEntity
): string[] => {
  const result =
    serviceModel.inter_service_relations?.map((relation) => relation.entity_type) || [];

  const embeddedEntitiesResult = (serviceModel.embedded_entities || []).flatMap((embedded_entity) =>
    findInterServiceRelations(embedded_entity)
  );

  return result.concat(embeddedEntitiesResult);
};

/**
 * Finds the inter-service relations objects for the given service model or embedded entity.
 *
 * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity to find inter-service relations for.
 *
 * @returns {InterServiceRelation[]} An array of inter-service relations objects that have inter-service relations
 */
export const findFullInterServiceRelations = (
  serviceModel: ServiceModel | EmbeddedEntity
): InterServiceRelation[] => {
  const result = serviceModel.inter_service_relations || [];

  const embeddedEntitiesResult = (serviceModel.embedded_entities || []).flatMap((embedded_entity) =>
    findFullInterServiceRelations(embedded_entity)
  );

  return result.concat(embeddedEntitiesResult);
};

/**
 * Finds the parent shape of an embedded entity: the shape it hangs off.
 * Uses the shape's known parents first, then any shape on the canvas that holds it as a child.
 *
 * @param {ServiceEntityShape} embeddedShape - The embedded entity shape
 * @param {Map<string, ServiceEntityShape>} canvasState - The shapes on the canvas
 * @returns {ServiceEntityShape | null} The parent shape or null if not found
 */
export const findParentShapeForEmbedded = (
  embeddedShape: ServiceEntityShape,
  canvasState: Map<string, ServiceEntityShape>
): ServiceEntityShape | null => {
  for (const parentId of embeddedShape.parentIds) {
    const parent = canvasState.get(parentId);
    if (parent) {
      return parent;
    }
  }

  for (const shape of canvasState.values()) {
    if (shape.id === embeddedShape.id) {
      continue;
    }
    // A parent stores its embedded children under the child's entity type.
    const children = shape.connections.get(embeddedShape.getEntityType()) || [];
    if (children.includes(embeddedShape.id)) {
      return shape;
    }
  }

  return null;
};

/**
 * Recursively finds an embedded entity definition in a service model or embedded entity.
 *
 * @param {ServiceModel | EmbeddedEntity} serviceModel - The service model or embedded entity to search in
 * @param {string} entityType - The entity type to find
 * @returns {EmbeddedEntity | null} The found embedded entity or null
 */
const findEmbeddedEntityRecursive = (
  serviceModel: ServiceModel | EmbeddedEntity,
  entityType: string
): EmbeddedEntity | null => {
  const embeddedEntities = serviceModel.embedded_entities || [];

  for (const embeddedEntity of embeddedEntities) {
    const entityKey = embeddedEntity.type || embeddedEntity.name;
    if (entityKey === entityType) {
      return embeddedEntity;
    }

    // Recursively search nested embedded entities
    const nested = findEmbeddedEntityRecursive(embeddedEntity, entityType);
    if (nested) {
      return nested;
    }
  }

  return null;
};

/**
 * Finds the service model for a given shape, handling embedded entities by finding their parent.
 *
 * @param {ServiceEntityShape} shape - The shape to find the service model for
 * @param {Map<string, ServiceEntityShape>} canvasState - The shapes on the canvas (for finding parent of embedded entities)
 * @param {ServiceModel[]} serviceCatalog - The service catalog (for finding service models)
 * @returns {ServiceModel | EmbeddedEntity | null} The service model or embedded entity, or null if not found
 */
const getServiceModelForShape = (
  shape: ServiceEntityShape,
  canvasState: Map<string, ServiceEntityShape>,
  serviceCatalog: ServiceModel[]
): ServiceModel | EmbeddedEntity | null => {
  const entityType = shape.getEntityType();

  if (shape.entityType === "embedded") {
    const parentShape = findParentShapeForEmbedded(shape, canvasState);
    if (parentShape) {
      const parentServiceModel = parentShape.serviceModel;
      const embeddedEntity = findEmbeddedEntityRecursive(parentServiceModel, entityType);

      return embeddedEntity || parentServiceModel;
    }

    return null;
  }

  return serviceCatalog.find((service) => service.name === entityType) || null;
};

const findRelationInServiceModel = (
  serviceModel: ServiceModel | EmbeddedEntity | null,
  targetEntityType: string
): { modifier: string | undefined } | null => {
  if (!serviceModel) {
    return null;
  }

  // First, try to find a matching inter-service relation declared on this
  // service/embedded entity.
  const interServiceRelation = serviceModel.inter_service_relations?.find(
    (rel) => rel.entity_type === targetEntityType || rel.name === targetEntityType
  );

  if (interServiceRelation) {
    return { modifier: interServiceRelation.modifier };
  }

  // If not found, look for a matching embedded entity relation. This allows us
  // to treat relations declared via embedded_entities as dependencies when
  // deciding if a shape can be removed (e.g. parent -> embedded child).
  const embeddedEntity = findEmbeddedEntityRecursive(serviceModel, targetEntityType);

  if (embeddedEntity) {
    return { modifier: embeddedEntity.modifier };
  }

  return null;
};

/**
 * Checks if removing a connection would violate the lower_limit requirement.
 *
 * @param {number} currentCount - Current number of connections
 * @param {number | bigint} lowerLimit - The required lower limit
 * @returns {boolean} True if removal would violate the limit, false otherwise
 */
const wouldViolateLowerLimit = (currentCount: number, lowerLimit: number | bigint): boolean => {
  // Convert bigint to number if needed
  const limit = typeof lowerLimit === "bigint" ? Number(lowerLimit) : lowerLimit;

  // If lowerLimit is 0, we can always remove (can't go below 0)
  // Otherwise, check if removal would violate the limit
  const countAfterRemoval = currentCount - 1;

  return limit > 0 && countAfterRemoval < limit;
};

/**
 * Checks if a relation has modifier "rw" and the shape is not new (preventing removal).
 *
 * @param {string | undefined} modifier - The relation modifier
 * @param {boolean} isNew - Whether the shape is new
 * @returns {boolean} True if removal should be prevented, false otherwise
 */
const isRwModifierBlockingRemoval = (modifier: string | undefined, isNew: boolean): boolean => {
  return modifier === "rw" && !isNew;
};

/**
 * Gets all shapes on the canvas that a given shape is connected to, in either direction:
 * a relation loaded from an instance is only recorded on the shape that holds it.
 *
 * @param {ServiceEntityShape} shape - The shape to find connected shapes for
 * @param {Map<string, ServiceEntityShape>} canvasState - The shapes on the canvas
 * @returns {Set<ServiceEntityShape>} Set of connected shapes
 */
const getConnectedShapes = (
  shape: ServiceEntityShape,
  canvasState: Map<string, ServiceEntityShape>
): Set<ServiceEntityShape> => {
  const connectedShapes = new Set<ServiceEntityShape>();

  shape.connections.forEach((ids) => {
    ids.forEach((id) => {
      const connectedShape = canvasState.get(id);
      if (connectedShape && connectedShape.id !== shape.id) {
        connectedShapes.add(connectedShape);
      }
    });
  });
  canvasState.forEach((otherShape) => {
    const holdsShape = Array.from(otherShape.connections.values()).some((ids) =>
      ids.includes(shape.id)
    );
    if (holdsShape && otherShape.id !== shape.id) {
      connectedShapes.add(otherShape);
    }
  });

  return connectedShapes;
};

/**
 * Gets relation information (rules and modifier) between two shapes using relationsDictionary.
 * For embedded entities, finds the parent and uses the parent's service model.
 *
 * @param {ServiceEntityShape} sourceShape - The source shape
 * @param {ServiceEntityShape} targetShape - The target shape
 * @param {RelationsDictionary} relationsDictionary - The relations dictionary
 * @param {Map<string, ServiceEntityShape>} canvasState - The shapes on the canvas (for finding parent of embedded entities)
 * @param {ServiceModel[]} serviceCatalog - The service catalog (for finding modifiers)
 * @returns {{ rules: Rules; modifier: string | undefined } | null} The relation info or null if not found
 */
export const getRelationInfo = (
  sourceShape: ServiceEntityShape,
  targetShape: ServiceEntityShape,
  relationsDictionary: RelationsDictionary,
  canvasState: Map<string, ServiceEntityShape>,
  serviceCatalog: ServiceModel[]
): { rules: Rules; modifier: string | undefined } | null => {
  const sourceEntityType = sourceShape.getEntityType();
  const targetEntityType = targetShape.getEntityType();

  // Get rules from relationsDictionary
  const sourceRelations = relationsDictionary[sourceEntityType];
  const rules = sourceRelations?.[targetEntityType];

  if (!rules) {
    return null;
  }

  // Find the modifier from the service model
  // For embedded entities, we need to find the parent and look in the parent's embedded_entities
  const serviceModel = getServiceModelForShape(sourceShape, canvasState, serviceCatalog);

  // Find the relation in the service model (or embedded entity). If it's not
  // actually declared on the source's service model, we treat it as
  // not blocking for the removal logic.
  const relation = findRelationInServiceModel(serviceModel, targetEntityType);
  if (!relation) {
    return null;
  }

  return {
    rules,
    modifier: relation.modifier,
  };
};

/**
 * Checks if a shape can be removed without violating relation requirements.
 * New shapes are always removable.
 * For existing shapes, prevents removal if:
 * 1. Removing would cause any connected shape to fall below the required lower_limit
 * 2. The shape has any relation with modifier "rw" and the shape is not new
 *
 * @param {ServiceEntityShape} shape - The shape to check
 * @param {Map<string, ServiceEntityShape>} canvasState - The shapes on the canvas (for finding connected shapes)
 * @param {RelationsDictionary} relationsDictionary - The relations dictionary
 * @param {ServiceModel[]} serviceCatalog - The service catalog (for finding modifiers)
 * @returns {boolean} True if the shape can be removed, false otherwise
 */
export const canRemoveShape = (
  shape: ServiceEntityShape,
  canvasState: Map<string, ServiceEntityShape>,
  relationsDictionary: RelationsDictionary,
  serviceCatalog: ServiceModel[]
): boolean => {
  // New shapes should always be removable
  if (shape.isNew) {
    return true;
  }

  const shapeEntityType = shape.getEntityType();

  // Check all connected shapes - removing this shape shouldn't cause them to violate lower_limit
  const connectedShapes = getConnectedShapes(shape, canvasState);

  // For each connected shape, check if removing this shape would violate its lower_limit
  for (const connectedShape of connectedShapes) {
    // Get relation info from connected shape to this shape
    const relationInfo = getRelationInfo(
      connectedShape,
      shape,
      relationsDictionary,
      canvasState,
      serviceCatalog
    );
    if (relationInfo) {
      // Check if relation is "rw" and connected shape is not new
      if (isRwModifierBlockingRemoval(relationInfo.modifier, connectedShape.isNew)) {
        return false;
      }

      // Check if removing would violate lower_limit for the connected shape
      const connections = connectedShape.connections.get(shapeEntityType) || [];
      const currentCount = connections.length;
      const lowerLimit = relationInfo.rules.lower_limit;

      if (wouldViolateLowerLimit(currentCount, lowerLimit)) {
        return false;
      }
    }
  }

  return true;
};

/**
 * How a shape can be taken off the canvas, the rules of its right-click menu and of the Delete
 * key. A new shape is only removed from the canvas: nothing is sent to the orchestrator for it.
 * An existing service or relation is deleted permanently: the order deletes it on deploy. An
 * existing embedded entity can't be taken off on its own, and neither can a shape the relations
 * require (canRemoveShape).
 *
 * @param {ServiceEntityShape} shape - The shape to take off the canvas
 * @param {Map<string, ServiceEntityShape>} canvasState - The shapes on the canvas
 * @param {RelationsDictionary} relationsDictionary - The relations dictionary
 * @param {ServiceModel[]} serviceCatalog - The service catalog
 * @returns {{ canRemoveFromCanvas: boolean, canDelete: boolean }} Which of the two is allowed;
 *   at most one is
 */
export const getRemoveActions = (
  shape: ServiceEntityShape,
  canvasState: Map<string, ServiceEntityShape>,
  relationsDictionary: RelationsDictionary,
  serviceCatalog: ServiceModel[]
): { canRemoveFromCanvas: boolean; canDelete: boolean } => {
  const canRemove = canRemoveShape(shape, canvasState, relationsDictionary, serviceCatalog);

  return {
    canRemoveFromCanvas: canRemove && shape.isNew,
    canDelete:
      canRemove && !shape.isNew && (shape.entityType === "core" || shape.entityType === "relation"),
  };
};

/**
 * Checks if a link can be removed between two shapes without violating relation requirements.
 * Prevents removal if:
 * 1. Removing would cause the shape to fall below the required lower_limit
 * 2. The relation has modifier "rw" and the shape is not new
 *
 * @param {ServiceEntityShape} sourceShape - The source shape
 * @param {ServiceEntityShape} targetShape - The target shape
 * @param {Map<string, ServiceEntityShape>} canvasState - The shapes on the canvas
 * @param {RelationsDictionary} relationsDictionary - The relations dictionary
 * @param {ServiceModel[]} serviceCatalog - The service catalog (for finding modifiers)
 * @returns {boolean} True if the link can be removed, false otherwise
 */
export const canRemoveLink = (
  sourceShape: ServiceEntityShape,
  targetShape: ServiceEntityShape,
  canvasState: Map<string, ServiceEntityShape>,
  relationsDictionary: RelationsDictionary,
  serviceCatalog: ServiceModel[]
): boolean => {
  const targetEntityType = targetShape.getEntityType();
  const sourceEntityType = sourceShape.getEntityType();

  // Check source shape -> target shape relation
  const sourceRelationInfo = getRelationInfo(
    sourceShape,
    targetShape,
    relationsDictionary,
    canvasState,
    serviceCatalog
  );
  if (sourceRelationInfo) {
    if (isRwModifierBlockingRemoval(sourceRelationInfo.modifier, sourceShape.isNew)) {
      return false;
    }

    const sourceConnections = sourceShape.connections.get(targetEntityType) || [];
    const currentCount = sourceConnections.length;
    if (wouldViolateLowerLimit(currentCount, sourceRelationInfo.rules.lower_limit)) {
      return false;
    }
  }

  // Check target shape -> source shape relation
  const targetRelationInfo = getRelationInfo(
    targetShape,
    sourceShape,
    relationsDictionary,
    canvasState,
    serviceCatalog
  );
  if (targetRelationInfo) {
    if (isRwModifierBlockingRemoval(targetRelationInfo.modifier, targetShape.isNew)) {
      return false;
    }

    const targetConnections = targetShape.connections.get(sourceEntityType) || [];
    const currentCount = targetConnections.length;
    if (wouldViolateLowerLimit(currentCount, targetRelationInfo.rules.lower_limit)) {
      return false;
    }
  }

  return true;
};
