import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, InterServiceRelation, ServiceModel } from "@/Core";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
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
 * Finds the parent shape for an embedded entity by looking at incoming links in the graph.
 *
 * @param {ServiceEntityShape} embeddedShape - The embedded entity shape
 * @param {dia.Graph} graph - The JointJS graph
 * @returns {ServiceEntityShape | null} The parent shape or null if not found
 */
export const findParentShapeForEmbedded = (
  embeddedShape: ServiceEntityShape,
  graph: dia.Graph
): ServiceEntityShape | null => {
  const links = graph.getLinks();

  for (const link of links) {
    const sourceElement = link.getSourceElement();
    const targetElement = link.getTargetElement();

    if (targetElement && String(targetElement.id) === String(embeddedShape.id)) {
      if (sourceElement && sourceElement instanceof ServiceEntityShape) {
        return sourceElement;
      }
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
 * @param {dia.Graph} graph - The JointJS graph (for finding parent of embedded entities)
 * @param {ServiceModel[]} serviceCatalog - The service catalog (for finding service models)
 * @returns {ServiceModel | EmbeddedEntity | null} The service model or embedded entity, or null if not found
 */
const getServiceModelForShape = (
  shape: ServiceEntityShape,
  graph: dia.Graph,
  serviceCatalog: ServiceModel[]
): ServiceModel | EmbeddedEntity | null => {
  const entityType = shape.getEntityName();

  if (shape.entityType === "embedded") {
    const parentShape = findParentShapeForEmbedded(shape, graph);
    if (parentShape) {
      const parentServiceModel = parentShape.serviceModel;
      const embeddedEntity = findEmbeddedEntityRecursive(parentServiceModel, entityType);
      return embeddedEntity || parentServiceModel;
    }
    return null;
  }

  return serviceCatalog.find((service) => service.name === entityType) || null;
};

/**
 * Finds a relation in a service model by entity type or name.
 *
 * @param {ServiceModel | EmbeddedEntity | null} serviceModel - The service model to search in
 * @param {string} targetEntityType - The target entity type to find the relation for
 * @returns {InterServiceRelation | undefined} The found relation or undefined
 */
const findRelationInServiceModel = (
  serviceModel: ServiceModel | EmbeddedEntity | null,
  targetEntityType: string
): InterServiceRelation | undefined => {
  return serviceModel?.inter_service_relations?.find(
    (rel) => rel.entity_type === targetEntityType || rel.name === targetEntityType
  );
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
 * Gets all shapes connected to a given shape via links in the graph.
 *
 * @param {ServiceEntityShape} shape - The shape to find connected shapes for
 * @param {dia.Graph} graph - The JointJS graph
 * @returns {Set<ServiceEntityShape>} Set of connected shapes
 */
const getConnectedShapes = (
  shape: ServiceEntityShape,
  graph: dia.Graph
): Set<ServiceEntityShape> => {
  const connectedShapes = new Set<ServiceEntityShape>();
  const links = graph.getLinks();
  const shapeId = String(shape.id);

  for (const link of links) {
    const sourceElement = link.getSourceElement();
    const targetElement = link.getTargetElement();

    if (sourceElement && String(sourceElement.id) === shapeId) {
      if (targetElement && targetElement instanceof ServiceEntityShape) {
        connectedShapes.add(targetElement);
      }
    } else if (targetElement && String(targetElement.id) === shapeId) {
      if (sourceElement && sourceElement instanceof ServiceEntityShape) {
        connectedShapes.add(sourceElement);
      }
    }
  }

  return connectedShapes;
};

/**
 * Gets relation information (rules and modifier) between two shapes using relationsDictionary.
 * For embedded entities, finds the parent and uses the parent's service model.
 *
 * @param {ServiceEntityShape} sourceShape - The source shape
 * @param {ServiceEntityShape} targetShape - The target shape
 * @param {RelationsDictionary} relationsDictionary - The relations dictionary
 * @param {dia.Graph} graph - The JointJS graph (for finding parent of embedded entities)
 * @param {ServiceModel[]} serviceCatalog - The service catalog (for finding modifiers)
 * @returns {{ rules: Rules; modifier: string | undefined } | null} The relation info or null if not found
 */
export const getRelationInfo = (
  sourceShape: ServiceEntityShape,
  targetShape: ServiceEntityShape,
  relationsDictionary: RelationsDictionary,
  graph: dia.Graph,
  serviceCatalog: ServiceModel[]
): { rules: Rules; modifier: string | undefined } | null => {
  const sourceEntityType = sourceShape.getEntityName();
  const targetEntityType = targetShape.getEntityName();

  // Get rules from relationsDictionary
  const sourceRelations = relationsDictionary[sourceEntityType];
  const rules = sourceRelations?.[targetEntityType];

  if (!rules) {
    return null;
  }

  // Find the modifier from the service model
  // For embedded entities, we need to find the parent and look in the parent's embedded_entities
  const serviceModel = getServiceModelForShape(sourceShape, graph, serviceCatalog);

  // Find the relation in the service model (or embedded entity)
  const relation = findRelationInServiceModel(serviceModel, targetEntityType);

  return {
    rules,
    modifier: relation?.modifier,
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
 * @param {dia.Graph} graph - The JointJS graph (for finding connected shapes)
 * @param {RelationsDictionary} relationsDictionary - The relations dictionary
 * @param {ServiceModel[]} serviceCatalog - The service catalog (for finding modifiers)
 * @returns {boolean} True if the shape can be removed, false otherwise
 */
export const canRemoveShape = (
  shape: ServiceEntityShape,
  graph: dia.Graph,
  relationsDictionary: RelationsDictionary,
  serviceCatalog: ServiceModel[]
): boolean => {
  // New shapes should always be removable
  if (shape.isNew) {
    return true;
  }

  const shapeEntityType = shape.getEntityName();

  // Check if the shape itself has any "rw" relations that aren't new
  // Iterate through all connections this shape has
  for (const [targetEntityType, connectionIds] of shape.connections.entries()) {
    if (connectionIds.length === 0) {
      continue;
    }

    // Get relation info from this shape to the target entity type
    const shapeRelations = relationsDictionary[shapeEntityType];
    const rules = shapeRelations?.[targetEntityType];

    if (rules) {
      // Find the modifier from the service model
      const serviceModel = getServiceModelForShape(shape, graph, serviceCatalog);
      const relation = findRelationInServiceModel(serviceModel, targetEntityType);

      // Check if relation is "rw" and shape is not new
      if (isRwModifierBlockingRemoval(relation?.modifier, shape.isNew)) {
        return false;
      }
    }
  }

  // Check all connected shapes - removing this shape shouldn't cause them to violate lower_limit
  const connectedShapes = getConnectedShapes(shape, graph);

  // For each connected shape, check if removing this shape would violate its lower_limit
  for (const connectedShape of connectedShapes) {
    // Get relation info from connected shape to this shape
    const relationInfo = getRelationInfo(
      connectedShape,
      shape,
      relationsDictionary,
      graph,
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
 * Checks if a link can be removed between two shapes without violating relation requirements.
 * Prevents removal if:
 * 1. Removing would cause the shape to fall below the required lower_limit
 * 2. The relation has modifier "rw" and the shape is not new
 *
 * @param {ServiceEntityShape} sourceShape - The source shape
 * @param {ServiceEntityShape} targetShape - The target shape
 * @param {dia.Graph} graph - The JointJS graph
 * @param {RelationsDictionary} relationsDictionary - The relations dictionary
 * @param {ServiceModel[]} serviceCatalog - The service catalog (for finding modifiers)
 * @returns {boolean} True if the link can be removed, false otherwise
 */
export const canRemoveLink = (
  sourceShape: ServiceEntityShape,
  targetShape: ServiceEntityShape,
  graph: dia.Graph,
  relationsDictionary: RelationsDictionary,
  serviceCatalog: ServiceModel[]
): boolean => {
  const targetEntityType = targetShape.getEntityName();
  const sourceEntityType = sourceShape.getEntityName();

  // Check source shape -> target shape relation
  const sourceRelationInfo = getRelationInfo(
    sourceShape,
    targetShape,
    relationsDictionary,
    graph,
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
    graph,
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
