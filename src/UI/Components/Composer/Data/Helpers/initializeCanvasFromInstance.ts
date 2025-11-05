import { dia } from "@inmanta/rappid";
import { ServiceModel, ServiceInstanceModel, EmbeddedEntity } from "@/Core";
import { ServiceEntityShape, ServiceEntityOptions } from "../../UI/JointJsShapes/ServiceEntityShape";
import { LinkShape } from "../../UI/JointJsShapes/LinkShape";
import { RelationsDictionary } from "./createRelationsDictionary";
import { InstanceWithRelations } from "@/Data/Queries";
import { v4 as uuidv4 } from "uuid";

/**
 * Helper function to recursively create embedded entity shapes
 * 
 * @param embeddedEntity - The embedded entity model definition
 * @param embeddedData - The embedded entity data from instance attributes
 * @param parentShape - The parent shape this embedded entity belongs to
 * @param rootEntityId - The ID of the root entity (main instance) this embedded entity belongs to
 * @param relationsDictionary - Dictionary of relations between services
 * @param graph - The JointJS graph to add entities to
 * @param canvasState - The canvas state map to add created shapes to
 * @param offsetX - X offset for positioning
 * @param offsetY - Y offset for positioning
 * @returns Array of created embedded entity shape IDs
 */
const createEmbeddedEntityShapes = (
    embeddedEntity: EmbeddedEntity,
    embeddedData: unknown,
    parentShape: ServiceEntityShape,
    rootEntityId: string,
    relationsDictionary: RelationsDictionary,
    graph: dia.Graph,
    canvasState: Map<string, ServiceEntityShape>,
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
        const embeddedId = uuidv4();

        // Recursively extract inter-service relations from embedded entity
        const interServiceRelations: Record<string, string[]> = {};
        embeddedEntity.inter_service_relations.forEach((relation) => {
            const relationValue = embeddedAttributes[relation.name];
            if (relationValue) {
                if (Array.isArray(relationValue)) {
                    interServiceRelations[relation.name] = relationValue.filter(
                        (val): val is string => typeof val === "string"
                    );
                } else if (typeof relationValue === "string") {
                    interServiceRelations[relation.name] = [relationValue];
                }
            }
        });

        // Recursively create nested embedded entities
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
                    offsetX + 150,
                    offsetY + index * 200
                );
                if (nestedIds.length > 0) {
                    nestedEmbeddedEntities[nestedEntity.name] = nestedIds;
                }
            }
        });

        // Track the root entity this embedded entity belongs to
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

        // Set the JointJS cell ID to match our embedded entity ID BEFORE adding to graph
        shape.set('id', embeddedId);

        // Position embedded entities
        shape.position(offsetX, offsetY + index * 150);

        // Add to graph (now with correct ID)
        shape.addTo(graph);
        canvasState.set(embeddedId, shape);
        createdIds.push(embeddedId);
    });

    return createdIds;
};

/**
 * Initializes the canvas with entities from instance data
 * 
 * @param instanceData - The instance data with its related instances
 * @param serviceCatalog - The full service catalog to find service models
 * @param relationsDictionary - Dictionary of relations between services
 * @param graph - The JointJS graph to add entities to
 * @returns A Map of entity IDs to ServiceEntityShape objects
 */
export const initializeCanvasFromInstance = (
    instanceData: InstanceWithRelations,
    serviceCatalog: ServiceModel[],
    relationsDictionary: RelationsDictionary,
    graph: dia.Graph
): Map<string, ServiceEntityShape> => {
    const canvasState = new Map<string, ServiceEntityShape>();
    const allInstances: ServiceInstanceModel[] = [
        instanceData.instance,
        ...instanceData.interServiceRelations,
    ];

    // Create a shape for each instance
    allInstances.forEach((instance, index) => {
        const serviceModel = serviceCatalog.find(
            (service) => service.name === instance.service_entity
        );

        if (!serviceModel) {
            console.warn(`Service model not found for ${instance.service_entity}`);
            return;
        }

        // Get the instance attributes, preferring candidate_attributes over active_attributes
        const instanceAttributes = instance.candidate_attributes || instance.active_attributes || {};

        // Determine entity type - the main instance is "core", relations are "relation"
        const entityType = index === 0 ? "core" : "relation";

        // Extract inter-service relations, embedded entities, and root entities
        // These will be populated based on the service model and instance attributes
        const interServiceRelations: Record<string, string[]> = {};
        const rootEntities: Record<string, string[]> = {}; // TODO: need to check this.

        // Extract inter-service relation IDs from attributes
        serviceModel.inter_service_relations.forEach((relation) => {
            const relationValue = instanceAttributes[relation.name];
            if (relationValue) {
                if (Array.isArray(relationValue)) {
                    interServiceRelations[relation.name] = relationValue.filter(
                        (val): val is string => typeof val === "string"
                    );
                } else if (typeof relationValue === "string") {
                    interServiceRelations[relation.name] = [relationValue];
                }
            }
        });

        // First, create the main shape without embedded entities
        const shapeOptions: ServiceEntityOptions = {
            entityType,
            readonly: false, // Set based on editable prop if needed
            isNew: false, // These are existing instances
            lockedOnCanvas: false,
            id: instance.id,
            relationsDictionary,
            serviceModel,
            instanceAttributes,
            rootEntities,
            interServiceRelations,
            embeddedEntities: {}, // Will be populated after creating embedded shapes
        };

        const shape = new ServiceEntityShape(shapeOptions);

        // Set the JointJS cell ID to match our instance ID BEFORE adding to graph
        shape.set('id', instance.id);

        // Position the shapes
        if (index === 0) {
            // Main instance in the center
            shape.position(100, 100);
        } else {
            // Related instances in a circle around the main instance
            const angle = (index - 1) * (360 / instanceData.interServiceRelations.length);
            const radius = 300;
            const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
            shape.position(x, y);
        }

        // Add to graph (now with correct ID) and canvas state
        shape.addTo(graph);
        canvasState.set(instance.id, shape);

        // Now create embedded entity shapes and track their IDs
        const embeddedEntities: Record<string, string[]> = {};
        const parentPosition = shape.position();
        serviceModel.embedded_entities.forEach((embeddedEntity, embeddedIndex) => {
            const embeddedData = instanceAttributes[embeddedEntity.name];
            if (embeddedData) {
                const embeddedIds = createEmbeddedEntityShapes(
                    embeddedEntity,
                    embeddedData,
                    shape,
                    instance.id, // Pass the root entity ID
                    relationsDictionary,
                    graph,
                    canvasState,
                    parentPosition.x + 350,
                    parentPosition.y + (embeddedIndex * 200)
                );
                if (embeddedIds.length > 0) {
                    embeddedEntities[embeddedEntity.name] = embeddedIds;
                    // Update the parent shape's connections
                    shape.connections.set(embeddedEntity.name, embeddedIds);
                }
            }
        });
    });

    // Create links between entities based on connections map
    canvasState.forEach((sourceShape) => {
        sourceShape.connections.forEach((targetIds, relationName) => {
            targetIds.forEach((targetId) => {
                const targetShape = canvasState.get(targetId);

                if (targetShape) {
                    try {
                        const link = new LinkShape();
                        link.source({ id: sourceShape.id, port: relationName });
                        link.target({ id: targetShape.id });
                        link.addTo(graph);
                    } catch (error) {
                        console.warn(`Failed to create link:`, error);
                    }
                }
            });
        });
    });

    return canvasState;
};

