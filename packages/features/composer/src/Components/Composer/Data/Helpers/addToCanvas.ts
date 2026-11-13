import { v4 as uuidv4 } from "uuid";
import { EmbeddedEntity, ServiceInstanceModel, ServiceModel } from "@inmanta/web-console-core";
import {
  createFormState,
  CreateModifierHandler,
  FieldCreator,
} from "@inmanta/web-console-core/FormState";
import { Inventories } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { HORIZONTAL_SPACING } from "../../config";
import { AttributeSets, EntityShapeType, Point, ServiceEntityShape } from "../ServiceEntityShape";
import { applyLayeredLayout } from "./canvasLayoutUtils";
import { applyRequiredConnections } from "./createPlaceholderInstance";
import { RelationsDictionary } from "./createRelationsDictionary";
import { createEmbeddedEntityShapes } from "./initializeCanvasFromInstance";
import { PositionTracker } from "./positionTracker";
import {
  getEmbeddedEntityKey,
  getInterServiceRelationKey,
  getLifecycleState,
  getShapeDimensions,
} from "./shapeUtils";

/**
 * Adds the embedded entities a shape carries in its attributes as shapes of their own,
 * to the right of it, and records them in its connections.
 */
const addEmbeddedEntities = (
  shape: ServiceEntityShape,
  embeddedData: Record<string, unknown>,
  relationsDictionary: RelationsDictionary,
  shapes: Map<string, ServiceEntityShape>,
  isNew: boolean,
  attributeSets?: AttributeSets
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
      isNew,
      isNew || !attributeSets
        ? undefined
        : {
            editableSet: attributeSets.candidate ? "candidate" : "active",
            // Only there to view when the composer works on the candidate set
            activeData: attributeSets.candidate
              ? attributeSets.active?.[embeddedEntity.name]
              : undefined,
          }
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
  serviceCatalog: ServiceModel[];

  /** The instances in the inventory, to find the instances the added one relates to */
  serviceInventories: Inventories | null;

  /** Instances that can't come back on the canvas: deleted from it, they are deleted on deploy */
  excludedIds?: Set<string>;
}

/**
 * Creates the shape of an existing instance, read-only, with its embedded entities, and adds them
 * to `shapes`. Its relations are recorded as the instance has them, so they count as there even
 * when the related instance isn't on the canvas, like when the composer opens an instance.
 */
const addInstanceShapes = (
  instance: ServiceInstanceModel,
  serviceModel: ServiceModel,
  relationsDictionary: RelationsDictionary,
  shapes: Map<string, ServiceEntityShape>
): ServiceEntityShape => {
  const instanceAttributes = {
    ...(instance.candidate_attributes || instance.active_attributes || {}),
    id: instance.id,
  };
  const attributeSets: AttributeSets = {
    ...(instance.candidate_attributes ? { candidate: instance.candidate_attributes } : {}),
    ...(instance.active_attributes ? { active: instance.active_attributes } : {}),
  };
  const interServiceRelations: Record<string, string[]> = {};

  serviceModel.inter_service_relations.forEach((relation) => {
    const relationValue = instanceAttributes[relation.name];
    const ids = (Array.isArray(relationValue) ? relationValue : [relationValue]).filter(
      (value): value is string => typeof value === "string" && value !== ""
    );

    if (ids.length > 0) {
      const key = getInterServiceRelationKey(relation);

      interServiceRelations[key] = [...new Set([...(interServiceRelations[key] || []), ...ids])];
    }
  });

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
    interServiceRelations,
    embeddedEntities: {},
    instanceState: getLifecycleState(serviceModel, instance.state),
    attributeSets,
  });

  shapes.set(shape.id, shape);
  addEmbeddedEntities(shape, instanceAttributes, relationsDictionary, shapes, false, attributeSets);

  return shape;
};

/**
 * Creates the shapes for an existing instance from the inventory, with its cluster: the instance
 * as a read-only relation, its embedded entities, and the instances it relates to that are in the
 * inventory but not on the canvas yet, with their embedded entities. Relations to instances on the
 * canvas connect to their cards, so no card is added twice.
 *
 * The cluster is laid out by relation depth (applyLayeredLayout) with the instance at the
 * position, and moved down until it clears the cards on the canvas.
 *
 * @returns The new shapes, keyed by id, the instance first.
 */
export const createInventoryEntityShapes = ({
  instance,
  serviceModel,
  position,
  canvasState,
  relationsDictionary,
  serviceCatalog,
  serviceInventories,
  excludedIds = new Set(),
}: InventoryEntityOptions): Map<string, ServiceEntityShape> => {
  const shapes = new Map<string, ServiceEntityShape>();
  const shape = addInstanceShapes(instance, serviceModel, relationsDictionary, shapes);
  const inventory = Object.values(serviceInventories || {}).flat();

  // The instances the cluster relates to, one level deep, like an instance the composer opens
  const relatedIds = new Set(
    Array.from(shapes.values()).flatMap((clusterShape) =>
      Array.from(clusterShape.connections.values()).flat()
    )
  );

  relatedIds.forEach((id) => {
    if (shapes.has(id) || canvasState.has(id) || excludedIds.has(id)) {
      return;
    }
    const related = inventory.find((candidate) => candidate.id === id);
    const relatedModel =
      related && serviceCatalog.find((model) => model.name === related.service_entity);

    if (related && relatedModel) {
      addInstanceShapes(related, relatedModel, relationsDictionary, shapes);
    }
  });

  // Arrange the cluster around the instance, at the position
  applyLayeredLayout(shapes);
  const anchor = shape.getPosition();

  moveShapes(shapes, position.x - anchor.x, position.y - anchor.y);
  moveClearOf(shapes, canvasState);

  return shapes;
};

/**
 * Moves shapes by an offset.
 */
const moveShapes = (shapes: Map<string, ServiceEntityShape>, dx: number, dy: number) =>
  shapes.forEach((shape) => {
    const { x, y } = shape.getPosition();

    shape.setPosition(x + dx, y + dy);
  });

/**
 * Moves shapes down, together, until the box around them covers none of the cards on the canvas.
 */
const moveClearOf = (
  shapes: Map<string, ServiceEntityShape>,
  canvasState: Map<string, ServiceEntityShape>
) => {
  const boxes = Array.from(shapes.values()).map((shape) => ({
    ...shape.getPosition(),
    ...getShapeDimensions(shape),
  }));
  const left = Math.min(...boxes.map(({ x }) => x));
  const top = Math.min(...boxes.map(({ y }) => y));
  const width = Math.max(...boxes.map(({ x, width }) => x + width)) - left;
  const height = Math.max(...boxes.map(({ y, height }) => y + height)) - top;
  const positionTracker = new PositionTracker();

  canvasState.forEach((canvasShape) => {
    const { x, y } = canvasShape.getPosition();
    const dimensions = getShapeDimensions(canvasShape);

    positionTracker.reserve(canvasShape.id, x, y, dimensions.width, dimensions.height);
  });

  moveShapes(shapes, 0, positionTracker.findNextYPosition(left, width, height, top) - top);
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
