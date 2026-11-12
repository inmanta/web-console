import { v4 as uuidv4 } from "uuid";
import { EmbeddedEntity, ServiceInstanceModel, ServiceModel } from "@inmanta/web-console-core";
import {
  createFormState,
  CreateModifierHandler,
  FieldCreator,
} from "@inmanta/web-console-core/FormState";
import { HORIZONTAL_SPACING } from "../../config";
import { EntityShapeType, Point, ServiceEntityShape } from "../ServiceEntityShape";
import { applyRequiredConnections } from "./createPlaceholderInstance";
import { RelationsDictionary } from "./createRelationsDictionary";
import { createEmbeddedEntityShapes } from "./initializeCanvasFromInstance";
import { PositionTracker } from "./positionTracker";
import { getEmbeddedEntityKey, getShapeDimensions } from "./shapeUtils";

/**
 * Adds the embedded entities a shape carries in its attributes as shapes of their own,
 * to the right of it, and records them in its connections.
 */
const addEmbeddedEntities = (
  shape: ServiceEntityShape,
  embeddedData: Record<string, unknown>,
  relationsDictionary: RelationsDictionary,
  shapes: Map<string, ServiceEntityShape>,
  isNew: boolean
) => {
  const positionTracker = new PositionTracker();
  const position = shape.getPosition();
  const { width, height } = getShapeDimensions(shape);

  positionTracker.reserve(shape.id, position.x, position.y, width, height);

  shape.serviceModel.embedded_entities?.forEach((embeddedEntity) => {
    const data = embeddedData[embeddedEntity.name];

    if (embeddedEntity.modifier === "r" || !data) {
      return;
    }

    const embeddedIds = createEmbeddedEntityShapes(
      embeddedEntity,
      data,
      shape,
      shape.id,
      relationsDictionary,
      shapes,
      new Map<string, string>(),
      positionTracker,
      position.x + HORIZONTAL_SPACING,
      position.y,
      isNew
    );

    if (embeddedIds.length > 0) {
      // Embedded entities of the same type share a key, so add to what is there.
      const entityKey = getEmbeddedEntityKey(embeddedEntity);
      shape.connections.set(entityKey, [
        ...(shape.connections.get(entityKey) || []),
        ...embeddedIds,
      ]);
    }
  });
};

interface NewEntityOptions {
  serviceModel: ServiceModel | EmbeddedEntity;
  entityType: EntityShapeType;
  position: Point;
  serviceCatalog: ServiceModel[];
  relationsDictionary: RelationsDictionary;
}

/**
 * Creates a new service or embedded entity for the canvas, with its default attribute values
 * and the embedded entities it requires.
 *
 * @returns The new shapes, keyed by id, the new entity first.
 */
export const createNewEntityShapes = ({
  serviceModel,
  entityType,
  position,
  serviceCatalog,
  relationsDictionary,
}: NewEntityOptions): Map<string, ServiceEntityShape> => {
  const fieldCreator = new FieldCreator(new CreateModifierHandler());
  const fields = fieldCreator.attributesToFields(serviceModel.attributes);

  const shape = new ServiceEntityShape({
    entityType,
    readonly: false,
    isNew: true,
    lockedOnCanvas: false,
    id: uuidv4(),
    relationsDictionary,
    serviceModel,
    instanceAttributes: createFormState(fields),
    rootEntities: {},
    interServiceRelations: {},
    embeddedEntities: {},
  });

  shape.setPosition(position.x, position.y);

  // Build placeholder attribute data for required embedded entities
  const placeholderAttrs: Record<string, unknown> = {};
  applyRequiredConnections(
    serviceModel.inter_service_relations ?? [],
    serviceModel.embedded_entities ?? [],
    placeholderAttrs,
    [],
    serviceCatalog
  );

  const shapes = new Map<string, ServiceEntityShape>([[shape.id, shape]]);
  addEmbeddedEntities(shape, placeholderAttrs, relationsDictionary, shapes, true);

  return shapes;
};

interface InventoryEntityOptions {
  instance: ServiceInstanceModel;
  serviceModel: ServiceModel;
  position: Point;
  canvasState: Map<string, ServiceEntityShape>;
  relationsDictionary: RelationsDictionary;
}

/**
 * Creates the shapes for an existing instance from the inventory: the instance as a
 * read-only relation, and its embedded entities. Its relations to instances already on the
 * canvas are connected.
 *
 * @returns The new shapes, keyed by id, the instance first.
 */
export const createInventoryEntityShapes = ({
  instance,
  serviceModel,
  position,
  canvasState,
  relationsDictionary,
}: InventoryEntityOptions): Map<string, ServiceEntityShape> => {
  const instanceAttributes = {
    ...(instance.candidate_attributes || instance.active_attributes || {}),
    id: instance.id,
  };

  const shape = new ServiceEntityShape({
    entityType: "relation",
    readonly: true,
    isNew: false,
    lockedOnCanvas: false,
    id: instance.id,
    relationsDictionary,
    serviceModel,
    instanceAttributes,
    rootEntities: {},
    interServiceRelations: {},
    embeddedEntities: {},
  });

  shape.setPosition(position.x, position.y);

  const shapes = new Map<string, ServiceEntityShape>([[shape.id, shape]]);
  addEmbeddedEntities(shape, instanceAttributes, relationsDictionary, shapes, false);

  // Connect the relations to instances that are already on the canvas
  serviceModel.inter_service_relations.forEach((relation) => {
    const relationValue = instanceAttributes[relation.name];
    const relationKey = relation.entity_type || relation.name;
    const values = Array.isArray(relationValue) ? relationValue : [relationValue];

    values.forEach((value) => {
      if (typeof value !== "string" || !canvasState.has(value)) {
        return;
      }

      const existing = shape.connections.get(relationKey) || [];
      if (!existing.includes(value)) {
        shape.connections.set(relationKey, [...existing, value]);
      }
    });
  });

  return shapes;
};

/**
 * The ids of the instances that can't be added from the inventory again, and why: they are on
 * the canvas, or were deleted from it and will be deleted on deploy.
 */
export const getUnavailableInventoryItems = (
  canvasState: Map<string, ServiceEntityShape>,
  initialShapeIds: Set<string>
): Map<string, "onCanvas" | "markedForDeletion"> => {
  const unavailable = new Map<string, "onCanvas" | "markedForDeletion">();

  canvasState.forEach((shape, shapeId) => {
    unavailable.set(shapeId, "onCanvas");
    const id = shape.instanceAttributes?.id;
    if (typeof id === "string") {
      unavailable.set(id, "onCanvas");
    }
  });
  initialShapeIds.forEach((id) => {
    if (!unavailable.has(id)) {
      unavailable.set(id, "markedForDeletion");
    }
  });

  return unavailable;
};
