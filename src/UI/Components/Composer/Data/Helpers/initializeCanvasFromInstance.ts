import { dia } from "@inmanta/rappid";
import { ServiceModel, ServiceInstanceModel, EmbeddedEntity } from "@/Core";
import { ServiceEntityShape, ServiceEntityOptions } from "../../UI/JointJsShapes/ServiceEntityShape";
import { LinkShape } from "../../UI/JointJsShapes/LinkShape";
import { RelationsDictionary } from "./createRelationsDictionary";
import { InstanceWithRelations } from "@/Data/Queries";
import { v4 as uuidv4 } from "uuid";
import { PositionTracker } from "./positionTracker";
import { applyGridLayout } from "./canvasLayoutUtils";

// Constants for layout spacing
const SHAPE_WIDTH = 264;
const SHAPE_MIN_HEIGHT = 50;
const HORIZONTAL_SPACING = 420;
const VERTICAL_SPACING = 200;
const NESTED_HORIZONTAL_OFFSET = 360;

const addRelationId = (collection: Record<string, string[]>, key: string, value: string) => {
    if (!collection[key]) {
        collection[key] = [];
    }

    if (!collection[key].includes(value)) {
        collection[key].push(value);
    }
};

const candidateKeyFields = ["identifier", "id", "name"];

const getEmbeddedEntityCacheKey = (
    rootEntityId: string,
    embeddedEntity: EmbeddedEntity,
    embeddedAttributes: Record<string, unknown>
): string | undefined => {
    const preferredKeys = embeddedEntity.key_attributes && embeddedEntity.key_attributes.length > 0
        ? embeddedEntity.key_attributes
        : candidateKeyFields;

    let keyValues: string[] = [];

    preferredKeys.forEach((key) => {
        const value = embeddedAttributes[key];
        if (value !== undefined && value !== null && (typeof value === "string" || typeof value === "number")) {
            keyValues.push(String(value));
        }
    });

    if (keyValues.length === 0) {
        return undefined;
    }

    return `${rootEntityId}:${embeddedEntity.name}:${keyValues.join("|")}`;
};

export const createEmbeddedEntityShapes = (
    embeddedEntity: EmbeddedEntity,
    embeddedData: unknown,
    parentShape: ServiceEntityShape,
    rootEntityId: string,
    relationsDictionary: RelationsDictionary,
    graph: dia.Graph,
    canvasState: Map<string, ServiceEntityShape>,
    embeddedEntityCache: Map<string, string>,
    positionTracker: PositionTracker,
    offsetX: number,
    offsetY: number
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
                        cachedShape.connections.set(rootConnectionKey, [...existingRootConnections, rootEntityId]);
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
                        let bboxWidth = SHAPE_WIDTH;
                        let bboxHeight = SHAPE_MIN_HEIGHT;
                        try {
                            const bbox = cachedShape.getBBox();
                            if (bbox && bbox.width > 0 && bbox.height > 0) {
                                bboxWidth = bbox.width;
                                bboxHeight = bbox.height;
                            }
                        } catch (e) {
                            // Fallback to default dimensions
                        }
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
            const relationKey = relation.entity_type || relation.name;

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
                    graph,
                    canvasState,
                    embeddedEntityCache,
                    positionTracker,
                    offsetX + NESTED_HORIZONTAL_OFFSET,
                    offsetY
                );

                if (nestedIds.length > 0) {
                    const entityKey = nestedEntity.type || nestedEntity.name;
                    nestedEmbeddedEntities[entityKey] = nestedIds;
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
            isNew: false,
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

        shape.set("id", embeddedId);

        // Find a non-overlapping position for this shape
        const parentPos = parentShape.position();
        const startY = parentPos.y + index * VERTICAL_SPACING;
        const finalY = positionTracker.findNextYPosition(offsetX, SHAPE_WIDTH, SHAPE_MIN_HEIGHT, startY);

        shape.position(offsetX, finalY);
        shape.addTo(graph);

        // Update columns display after shape is added to graph
        shape.updateColumnsDisplay();

        // Get the actual bounding box to reserve the correct space
        // If bbox is not available yet, use default dimensions
        let bboxWidth = SHAPE_WIDTH;
        let bboxHeight = SHAPE_MIN_HEIGHT;
        try {
            const bbox = shape.getBBox();
            if (bbox && bbox.width > 0 && bbox.height > 0) {
                bboxWidth = bbox.width;
                bboxHeight = bbox.height;
            }
        } catch (e) {
            // Fallback to default dimensions if bbox is not available
        }
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
 * Creates links between shapes based on their connections maps.
 * This is the same simple logic used in initializeCanvasFromInstance.
 */
export const createLinksFromCanvasState = (
    canvasState: Map<string, ServiceEntityShape>,
    graph: dia.Graph
): void => {
    if (!graph) {
        return;
    }

    canvasState.forEach((sourceShape) => {
        // Verify shape is in graph before processing
        if (!graph.getCell(sourceShape.id)) {
            return;
        }

        let neighbors: dia.Cell[];
        try {
            neighbors = graph.getNeighbors(sourceShape as dia.Element);
        } catch (error) {
            console.error(`Failed to get neighbors for ${sourceShape.id}:`, error);
            return;
        }

        const existingNeighbors = new Set(
            neighbors.map((neighbor) => String(neighbor.id))
        );

        sourceShape.connections.forEach((targetIds, relationName) => {
            const uniqueTargetIds = [...new Set(targetIds)];

            uniqueTargetIds.forEach((targetId) => {
                const targetShape = canvasState.get(targetId);

                if (!targetShape || existingNeighbors.has(String(targetId))) {
                    return;
                }

                // Verify target is in graph
                if (!graph.getCell(targetShape.id)) {
                    return;
                }

                // Check if link already exists by checking all links in the graph
                // This prevents duplicates when links are manually created
                const existingLinks = graph.getLinks();
                const linkAlreadyExists = existingLinks.some(link => {
                    const linkSource = link.source();
                    const linkTarget = link.target();
                    return (linkSource.id === sourceShape.id && linkTarget.id === targetId) ||
                        (linkSource.id === targetId && linkTarget.id === sourceShape.id);
                });

                if (linkAlreadyExists) {
                    return;
                }

                try {
                    const link = new LinkShape();
                    link.source({ id: sourceShape.id, port: relationName });
                    link.target({ id: targetShape.id });
                    link.addTo(graph);

                    existingNeighbors.add(String(targetId));
                } catch (error) {
                    console.warn(`Failed to create link from ${sourceShape.id} to ${targetId}:`, error);
                }
            });
        });
    });
};

export const initializeCanvasFromInstance = (
    instanceData: InstanceWithRelations,
    serviceCatalog: ServiceModel[],
    relationsDictionary: RelationsDictionary,
    graph: dia.Graph
): Map<string, ServiceEntityShape> => {
    const canvasState = new Map<string, ServiceEntityShape>();
    const embeddedEntityCache = new Map<string, string>();
    const positionTracker = new PositionTracker();
    const allInstances: ServiceInstanceModel[] = [
        instanceData.instance,
        ...instanceData.interServiceRelations,
    ];

    allInstances.forEach((instance, index) => {
        const serviceModel = serviceCatalog.find(
            (service) => service.name === instance.service_entity
        );

        if (!serviceModel) {
            console.warn(`Service model not found for ${instance.service_entity}`);
            return;
        }

        const instanceAttributes = instance.candidate_attributes || instance.active_attributes || {};
        const entityType = index === 0 ? "core" : "relation";

        const interServiceRelations: Record<string, string[]> = {};
        const rootEntities: Record<string, string[]> = {};

        serviceModel.inter_service_relations.forEach((relation) => {
            const relationValue = instanceAttributes[relation.name];
            const relationKey = relation.entity_type || relation.name;

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
            isNew: false,
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
        shape.set("id", instance.id);

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
        shape.addTo(graph);

        // Update columns display after shape is added to graph
        shape.updateColumnsDisplay();

        // Reserve the position for the main instance
        let bboxWidth = SHAPE_WIDTH;
        let bboxHeight = SHAPE_MIN_HEIGHT;
        try {
            const bbox = shape.getBBox();
            if (bbox && bbox.width > 0 && bbox.height > 0) {
                bboxWidth = bbox.width;
                bboxHeight = bbox.height;
            }
        } catch (e) {
            // Fallback to default dimensions
        }
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
                    graph,
                    canvasState,
                    embeddedEntityCache,
                    positionTracker,
                    parentPosition.x + HORIZONTAL_SPACING,
                    parentPosition.y
                );

                if (embeddedIds.length > 0) {
                    const entityKey = embeddedEntity.type || embeddedEntity.name;
                    shape.connections.set(entityKey, embeddedIds);
                }
            }
        });
    });

    createLinksFromCanvasState(canvasState, graph);

    applyGridLayout(graph);

    return canvasState;
};
