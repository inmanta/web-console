import { dia, ui, shapes, mvc } from "@inmanta/rappid";
import { Inventories } from "@/Data/Queries";
import { EmbeddedEntity, ServiceInstanceModel, ServiceModel } from "@/Core";
import { Dispatch, SetStateAction } from "react";
import { ServiceEntityShape, ServiceEntityOptions } from "./ServiceEntityShape";
import { RelationsDictionary } from "../../Data";
import { createSidebarItem } from "./sidebarItem";
import { v4 as uuidv4 } from "uuid";
import { createEmbeddedEntityShapes } from "../../Data/Helpers/initializeCanvasFromInstance";
import { PositionTracker } from "../../Data/Helpers/positionTracker";
import { t_global_background_color_primary_default } from "@patternfly/react-tokens";
import { toggleDisabledSidebarItem } from "../../Data/Helpers/disableSidebarItem";
import { updateAllMissingConnectionsHighlights } from "./createHalo";

const GRID_SIZE = 8;
const PADDING_S = GRID_SIZE;
const HORIZONTAL_SPACING = 420;

export class InventoryTabElement {
    stencil: ui.Stencil;
    private setCanvasState: Dispatch<SetStateAction<Map<string, ServiceEntityShape>>>;
    private canvasState: Map<string, ServiceEntityShape>;
    private graph: dia.Graph;
    private paper: dia.Paper;
    private relationsDictionary: RelationsDictionary;
    private embeddedEntityCache: Map<string, string>;
    private positionTracker: PositionTracker;
    private serviceInventories: Inventories;
    private serviceModels: ServiceModel[];

    constructor(
        htmlRef: HTMLElement,
        scroller: ui.PaperScroller,
        serviceInventories: Inventories,
        serviceModels: ServiceModel[],
        setCanvasState: Dispatch<SetStateAction<Map<string, ServiceEntityShape>>>,
        graph: dia.Graph,
        relationsDictionary: RelationsDictionary,
        initialCanvasState: Map<string, ServiceEntityShape>
    ) {
        this.setCanvasState = setCanvasState;
        this.canvasState = initialCanvasState;
        this.graph = graph;
        // Paper will be set from the drop handler
        this.paper = null as unknown as dia.Paper;
        this.relationsDictionary = relationsDictionary;
        this.embeddedEntityCache = new Map<string, string>();
        this.positionTracker = new PositionTracker();
        this.serviceInventories = serviceInventories;
        this.serviceModels = serviceModels;
        const groups = buildGroups(serviceInventories, serviceModels, initialCanvasState);

        this.stencil = new ui.Stencil({
            id: "inventory-stencil",
            testid: "inventory-stencil",
            className: "joint-stencil hidden",
            paper: scroller,
            width: 240,
            scaleClones: true,
            dropAnimation: true,
            marginTop: PADDING_S,
            paperPadding: PADDING_S,
            marginLeft: PADDING_S,
            marginRight: PADDING_S,
            paperOptions: {
                sorting: dia.Paper.sorting.NONE,
            },
            groups: groups as unknown as { [key: string]: ui.Stencil.Group },
            search: {
                "*": ["attrs/label/text"],
                "standard.Image": ["description"],
                "standard.Path": ["description"],
            },
            canDrag: (cellView: dia.CellView) => {
                return !cellView.model.get("disabled");
            },
            dragStartClone: (cell: dia.Cell) => cell.clone(),
            dragEndClone: (cell: dia.Cell) => {
                const serviceModel = cell.get("serviceModel") as ServiceModel;
                const instanceAttributes = (cell.get("instanceAttributes") ||
                    {}) as Record<string, unknown>;

                const shapeOptions: ServiceEntityOptions = {
                    entityType: "relation",
                    readonly: true,
                    isNew: false,
                    lockedOnCanvas: false,
                    id: (instanceAttributes.id as string) || String(cell.id),
                    relationsDictionary,
                    serviceModel,
                    instanceAttributes: instanceAttributes,
                    rootEntities: {},
                    interServiceRelations: {},
                    embeddedEntities: {},
                };

                const shape = new ServiceEntityShape(shapeOptions);
                shape.sanitizedAttrs = JSON.parse(JSON.stringify(instanceAttributes));

                return shape;
            },
            layout: {
                columns: 1,
                rowHeight: "compact",
                marginY: 10,
                horizontalAlign: "left",
                // reset defaults
                resizeToFit: false,
                centre: false,
                dx: 0,
                dy: 10,
                background: t_global_background_color_primary_default.var,
            },
        });

        htmlRef.appendChild(this.stencil.el);
        this.stencil.el.querySelector(".search")?.classList.add("pf-v6-c-text-input-group__text-input");

        this.stencil.render();

        const groupKeys = Object.keys(groups);

        if (groupKeys.length > 0) {
            this.stencil.load(groups);
        }

        this.stencil.freeze();

        this.stencil.on("element:drop", (elementView) => {
            const model: ServiceEntityShape = elementView.model as ServiceEntityShape;
            const initialModelId = String(model.id);
            let modelId = initialModelId;
            const serviceModel = model.serviceModel as ServiceModel;

            // Set paper from the drop handler if not already set
            if (!this.paper && elementView.paper) {
                this.paper = elementView.paper;
            }

            // Clear cache for new drop
            this.embeddedEntityCache.clear();

            // Get the drop position - the model should already have a position from the drop
            // If not, use the paper's current viewport center as fallback
            let dropX: number;
            let dropY: number;

            const currentPosition = model.position();
            if (currentPosition && currentPosition.x !== undefined && currentPosition.y !== undefined) {
                dropX = currentPosition.x;
                dropY = currentPosition.y;
            } else {
                // Fallback: use paper center or a default position
                const paper = elementView.paper;
                const paperArea = paper.getArea();
                dropX = paperArea.x + paperArea.width / 2;
                dropY = paperArea.y + paperArea.height / 2;
                model.position(dropX, dropY);
            }

            model.set("id", modelId);
            model.addTo(graph);
            modelId = String(model.id);
            if (modelId !== initialModelId) {
            }
            model.updateColumnsDisplay();

            // Reserve position for main shape
            let bboxWidth = 264;
            let bboxHeight = 50;
            try {
                const bbox = model.getBBox();
                if (bbox && bbox.width > 0 && bbox.height > 0) {
                    bboxWidth = bbox.width;
                    bboxHeight = bbox.height;
                }
            } catch (e) {
                // Fallback to default dimensions
            }
            this.positionTracker.reserve(modelId, dropX, dropY, bboxWidth, bboxHeight);

            // Process embedded entities using the same helper as initializeCanvasFromInstance
            const parentPosition = model.position();
            serviceModel.embedded_entities.forEach((embeddedEntity) => {
                if (embeddedEntity.modifier === "r") {
                    return;
                }
                const embeddedData = model.instanceAttributes?.[embeddedEntity.name];
                if (embeddedData) {
                    const embeddedIds = createEmbeddedEntityShapes(
                        embeddedEntity,
                        embeddedData,
                        model,
                        modelId,
                        this.relationsDictionary,
                        graph,
                        this.canvasState,
                        this.embeddedEntityCache,
                        this.positionTracker,
                        parentPosition.x + HORIZONTAL_SPACING,
                        parentPosition.y
                    );

                    if (embeddedIds.length > 0) {
                        const entityKey = embeddedEntity.type || embeddedEntity.name;
                        model.connections.set(entityKey, embeddedIds);
                    }
                }
            });

            // Connect existing inter-service relations
            this.connectExistingRelations(model, serviceModel);

            // Disable the corresponding sidebar item using the model's id
            if (modelId) {
                toggleDisabledSidebarItem(modelId, true);
            }

            // Ensure all shapes are fully registered in the graph before updating canvasState
            // JointJS needs a moment to process addTo() calls
            requestAnimationFrame(() => {
                // Verify main shape is in graph
                const mainShapeInGraph = !!graph.getCell(modelId);

                if (!mainShapeInGraph) {
                    // Retry once more after another frame to add related shapes.
                    requestAnimationFrame(() => {
                        this.updateCanvasStateAfterDrop(modelId, model, graph, setCanvasState);
                    });
                    return;
                }

                this.updateCanvasStateAfterDrop(modelId, model, graph, setCanvasState);
            });

        });
    }

    private updateCanvasStateAfterDrop(
        modelId: string,
        model: ServiceEntityShape,
        graph: dia.Graph,
        setCanvasState: React.Dispatch<React.SetStateAction<Map<string, ServiceEntityShape>>>
    ) {
        // Update canvasState with ALL shapes (main + embedded entities) - createEmbeddedEntityShapes modifies canvasState directly
        // so we need to sync it with React state AFTER all shapes are created
        setCanvasState((prevCanvasState) => {
            const newCanvasState = new Map(prevCanvasState);
            // Add main shape
            newCanvasState.set(modelId, model);
            // Add all embedded shapes from our local canvasState
            this.canvasState.forEach((shape, id) => {
                newCanvasState.set(id, shape);
            });
            this.canvasState = newCanvasState;

            // Update missing connections highlights after new item is dropped and state is updated
            // Use requestAnimationFrame to ensure all shapes are fully rendered
            requestAnimationFrame(() => {
                updateAllMissingConnectionsHighlights(this.paper);
            });

            return newCanvasState;
        });
    }


    private connectExistingRelations(parentShape: ServiceEntityShape, serviceModel: ServiceModel) {
        const attributes = parentShape.instanceAttributes || {};

        serviceModel.inter_service_relations.forEach((relation) => {
            const relationValue = attributes[relation.name];
            const relationKey = relation.entity_type || relation.name;
            if (!relationValue) {
                return;
            }

            const values = Array.isArray(relationValue) ? relationValue : [relationValue];

            values.forEach((value) => {
                if (typeof value !== "string") {
                    return;
                }

                const targetShape = this.graph.getCell(value) as ServiceEntityShape | undefined;
                if (!targetShape) {
                    return;
                }

                // Update connections map, but don't create link yet - we'll batch create them
                const existing = parentShape.connections.get(relationKey) || [];
                if (!existing.includes(value)) {
                    parentShape.connections.set(relationKey, [...existing, value]);
                }
            });
        });
    }

}

/**
 * Type for stencil groups that matches what stencil.load() accepts.
 * JointJS runtime accepts arrays of cells, even though the constructor types expect Group objects.
 */
type StencilGroups = { [groupName: string]: Array<dia.Cell | mvc.ObjectHash> };

/**
 * Builds groups for the stencil, returning a type that matches what stencil.load() accepts.
 * Each group is an array of cells that can be loaded into the stencil.
 */
const buildGroups = (
    serviceInventories: Inventories,
    serviceModels: ServiceModel[],
    canvasState: Map<string, ServiceEntityShape>
): StencilGroups => {
    // Get set of instance IDs that are already on the canvas
    const canvasInstanceIds = new Set<string>();
    canvasState.forEach((shape, shapeId) => {
        // The shape ID is the instance ID for inventory items
        canvasInstanceIds.add(shapeId);
        // Also check instanceAttributes.id in case it's different
        const instanceAttrs = shape.instanceAttributes;
        if (instanceAttrs && instanceAttrs.id && typeof instanceAttrs.id === "string") {
            canvasInstanceIds.add(instanceAttrs.id);
        }
    });

    const groups: StencilGroups = {};

    Object.entries(serviceInventories).forEach(([serviceName, instances]) => {
        const serviceModel = serviceModels.find((model) => model.name === serviceName);

        if (!serviceModel) {
            return;
        }

        if (instances.length === 0) {
            return;
        }

        groups[serviceName] = instances.map((instance, index) => {
            const isOnCanvas = canvasInstanceIds.has(instance.id);
            return createInventorySidebarItem(instance, serviceModel, index, isOnCanvas);
        });
    });
    return groups;
};

const createInventorySidebarItem = (
    instance: ServiceInstanceModel,
    serviceModel: ServiceModel,
    index: number,
    isDisabled: boolean = false
) => {
    const attributes =
        instance.candidate_attributes || instance.active_attributes || ({} as Record<string, unknown>);

    const instanceAttributes = {
        ...attributes,
        id: instance.id,
    };

    const displayName = instance.service_identity_attribute_value || instance.id;

    return createSidebarItem({
        entityType: "relation",
        serviceModel,
        instanceAttributes,
        embeddedEntities: {},
        interServiceRelations: {},
        rootEntities: {},
        readonly: true,
        isNew: false,
        isDisabled,
        index,
        id: instance.id,
        label: displayName,
    });
};
