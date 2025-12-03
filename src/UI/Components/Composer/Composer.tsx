import { useGetInventoryList, useGetServiceModels, useGetInstanceWithRelations } from "@/Data/Queries";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ComposerContext, composerContext } from "./Data/Context";
import { ComposerContainer, Canvas, LeftSidebar, RightSidebar } from "./UI";
import { dia, shapes, ui } from "@inmanta/rappid";
import { ComposerPaper } from "./UI/JointJsShapes/ComposerPaper";
import { LinkShape } from "./UI/JointJsShapes/LinkShape";
import {
    createRelationsDictionary,
    RelationsDictionary,
    initializeCanvasFromInstance,
    createPlaceholderInstance,
    applyCoordinatesFromMetadata,
    createLinksFromCanvasState,
    isServiceEntityShapeCell,
} from "./Data/Helpers";
import { ServiceEntityShape } from "./UI";
import { createHalo, updateAllMissingConnectionsHighlights } from "./UI/JointJsShapes/createHalo";
import { InstanceAttributeModel } from "@/Core";

interface Props {
    editable: boolean;
    instanceId?: string;
    serviceName: string;
}

export const Composer: React.FC<Props> = ({ editable, instanceId, serviceName }) => {
    const [catalogEntries, setCatalogEntries] = useState<string[]>([]);
    const [canvasState, setCanvasState] = useState<Map<string, ServiceEntityShape>>(new Map());
    const [activeCell, setActiveCell] = useState<ServiceEntityShape | null>(null);
    const [formState, setFormState] = useState<InstanceAttributeModel>({});
    const haloRef = useRef<ui.Halo | null>(null);
    const skipLinkRemovalRef = useRef(false);
    const initializationKeyRef = useRef<string | null>(null);
    const serviceCatalogQuery = useGetServiceModels().useContinuousNoRefetch();
    const relationsDictionary: RelationsDictionary = useMemo(() => createRelationsDictionary(serviceCatalogQuery.data || []), [serviceCatalogQuery.data]);

    // We could fetch the main service individually, 
    // but since we already have the full catalog, we save a call by filtering it out.
    const mainService = useMemo(() => {
        const data = serviceCatalogQuery.data;
        if (data) {
            return data.find((service) => service.name === serviceName);
        } else {
            return undefined;
        }
    }, [serviceCatalogQuery.data, serviceName]);

    const inventoriesQuery = useGetInventoryList(catalogEntries).useContinuousNoRefetch();

    // Create graph, paper, and scroller only once using useMemo to prevent recreation on every render
    const graph = useMemo(() => new dia.Graph({}, { cellNamespace: shapes }), []);
    const paper = useMemo(() => new ComposerPaper(graph, editable).paper, [graph, editable]);
    const scroller = useMemo(() => new ui.PaperScroller({
        paper,
        cursor: "grab",
        baseWidth: 1000,
        baseHeight: 1000,
        inertia: { friction: 0.8 },
        autoResizePaper: true,
        contentOptions: function () {
            return {
                useModelGeometry: true,
                allowNewOrigin: "any",
                padding: 40,
                allowNegativeBottomRight: true,
            };
        },
    }), [paper]);

    // Fetch instance data if instanceId is provided
    // The query will only run if instanceId and mainService are present (enabled check in the hook)
    const instanceWithRelationsQuery = useGetInstanceWithRelations(
        instanceId || "",
        false,
        mainService
    ).useOneTimeNoRefetch();

    useEffect(() => {
        if (serviceCatalogQuery.isSuccess) {
            setCatalogEntries(serviceCatalogQuery.data.map((service) => service.name));
        }
    }, [serviceCatalogQuery.isSuccess]);

    // Initialize canvas from instance data or create placeholder for new instance
    useEffect(() => {
        if (!serviceCatalogQuery.data || !mainService || !graph || !paper || !scroller) {
            return;
        }

        const initializationKey = `${serviceName ?? ""}:${instanceId ?? "new"}`;
        if (
            initializationKeyRef.current === initializationKey &&
            graph.getCells().length > 0
        ) {
            // Already initialized for this instance; avoid clearing user changes
            return;
        }

        let instanceData;

        if (instanceId) {
            // Case 1: Editing existing instance - wait for data to be fetched
            if (!instanceWithRelationsQuery.isSuccess || !instanceWithRelationsQuery.data) {
                return;
            }
            instanceData = instanceWithRelationsQuery.data;
        } else {
            // Case 2: Creating new instance - use placeholder
            instanceData = createPlaceholderInstance(mainService);
        }

        // Clear the graph to remove any old cells before initializing
        graph.getCells().forEach((cell) => cell.remove());

        // Add all entities to the graph
        const initializedEntities = initializeCanvasFromInstance(
            instanceData,
            serviceCatalogQuery.data,
            relationsDictionary,
            graph
        );
        setCanvasState(initializedEntities);
        initializationKeyRef.current = initializationKey;

        // Check if instance has saved coordinates in metadata
        const hasMetadataCoordinates =
            instanceData.instance.metadata?.coordinates;

        if (hasMetadataCoordinates) {
            try {
                const parsedMetadata = JSON.parse(instanceData.instance.metadata.coordinates);
                if (parsedMetadata.version === "v2" && parsedMetadata.data) {
                    // Apply saved coordinates from metadata (overrides manual positioning)
                    applyCoordinatesFromMetadata(graph, parsedMetadata.data);
                }
            } catch (error) {
                console.warn("Failed to parse coordinates from metadata:", error);
            }
        }

        // Unfreeze paper if it's frozen
        if (paper.isFrozen()) {
            paper.unfreeze();
        }

        // Center and zoom to fit content
        scroller.centerContent();

        // Update missing connections highlights after canvas is initialized
        // Use setTimeout to ensure paper is fully rendered
        setTimeout(() => {
            updateAllMissingConnectionsHighlights(paper);
        }, 100);
    }, [
        instanceId,
        instanceWithRelationsQuery.isSuccess,
        instanceWithRelationsQuery.data,
        serviceCatalogQuery.data,
        mainService,
        relationsDictionary,
        graph,
        paper,
        scroller,
    ]);

    // Wire up click events on paper
    useEffect(() => {
        if (!paper || !graph) {
            return;
        }

        // Handle clicks on empty canvas space - clear the form and halo
        const handleBlankClick = () => {
            haloRef.current?.remove();
            haloRef.current = null;
            setActiveCell(null);
            setFormState({});
        };

        // Handle clicks on shapes - load sanitizedAttrs into form and show halo
        const handleCellClick = (cellView: dia.CellView) => {
            const cell = cellView.model;
            // Only handle ServiceEntityShape, not links
            if (cell instanceof dia.Link) {
                return;
            }

            if (!isServiceEntityShapeCell(cell)) {
                return;
            }

            const sanitizedAttrs = cell.getSanitizedAttributes();
            setActiveCell(cell);
            setFormState(sanitizedAttrs);

            // Show halo if editable
            if (editable) {
                // Remove any existing halo
                haloRef.current?.remove();

                // Create and show new halo
                const halo = createHalo(graph, paper, cellView, relationsDictionary);
                halo.render();
                haloRef.current = halo;
            }
        };

        paper.on("blank:pointerdown", handleBlankClick);
        paper.on("cell:pointerup", handleCellClick);

        return () => {
            paper.off("blank:pointerdown", handleBlankClick);
            paper.off("cell:pointerup", handleCellClick);
        };
    }, [paper, graph, editable, relationsDictionary]);


    useEffect(() => {
        if (!paper || !graph) {
            return;
        }

        // Helper function to validate source cell exists
        const validateSourceCell = (linkView: dia.LinkView): ServiceEntityShape | null => {
            const source = linkView.model.source();
            if (!source.id) {
                linkView.remove();
                return null;
            }

            const sourceCell = graph.getCell(source.id);
            if (!sourceCell || !isServiceEntityShapeCell(sourceCell)) {
                linkView.remove();
                return null;
            }

            return sourceCell;
        };

        // Helper function to get and validate both shapes from a link
        const getShapesFromLink = (link: dia.Link): { sourceShape: ServiceEntityShape; targetShape: ServiceEntityShape } | null => {
            const source = link.source();
            const target = link.target();

            if (!source.id || !target.id) {
                return null;
            }

            const sourceCell = graph.getCell(source.id);
            const targetCell = graph.getCell(target.id);

            if (!sourceCell || !targetCell || !isServiceEntityShapeCell(sourceCell) || !isServiceEntityShapeCell(targetCell)) {
                return null;
            }

            return { sourceShape: sourceCell, targetShape: targetCell };
        };

        // Helper function to update canvas state with two shapes
        const updateCanvasStateWithShapes = (sourceShape: ServiceEntityShape, targetShape: ServiceEntityShape) => {
            setCanvasState((prev) => {
                const updated = new Map(prev);
                updated.set(sourceShape.id, sourceShape);
                updated.set(targetShape.id, targetShape);
                return updated;
            });
        };

        // Helper function to create a LinkShape with default router/connector/anchor from paper options
        const createLinkShape = (sourceShape: ServiceEntityShape, targetShape: ServiceEntityShape, sourceRelationKey: string): dia.Link => {
            const link = new LinkShape();

            // Get options from paper (where they're actually set)
            const paperOptions = paper.options;
            const defaultRouter = paperOptions?.defaultRouter;
            const defaultConnector = paperOptions?.defaultConnector;
            const defaultAnchor = paperOptions?.defaultAnchor;

            if (defaultRouter) {
                link.router(defaultRouter);
            }
            if (defaultConnector) {
                link.connector(defaultConnector);
            }
            if (defaultAnchor) {
                link.set("defaultAnchor", defaultAnchor);
            }

            link.source({ id: sourceShape.id, port: sourceRelationKey });
            link.target({ id: targetShape.id });
            return link;
        };

        // Intercept link creation to validate source cell exists
        const handleLinkPointerDown = (linkView: dia.LinkView) => {
            validateSourceCell(linkView);
        };

        // Handle link connection (fires when user connects a link to a target)
        // Note: We use paper.link:connect instead of graph.add because it fires at the right semantic moment
        const handleLinkConnect = (linkView: dia.LinkView) => {
            const shapes = getShapesFromLink(linkView.model);
            if (!shapes) {
                linkView.remove();
                return;
            }

            const { sourceShape, targetShape } = shapes;

            if (!sourceShape.validateConnection(targetShape) || !targetShape.validateConnection(sourceShape)) {
                linkView.remove();
                return;
            }

            const sourceRelationKey = targetShape.getEntityName();
            const targetRelationKey = sourceShape.getEntityName();

            // Add connections to both shapes
            sourceShape.addConnection(targetShape.id, sourceRelationKey);
            targetShape.addConnection(sourceShape.id, targetRelationKey);

            // Replace temporary link with a persistent LinkShape so routing/magnets behave the same
            skipLinkRemovalRef.current = true;
            linkView.model.remove();

            const link = createLinkShape(sourceShape, targetShape, sourceRelationKey);
            link.addTo(graph);

            // Update canvas state and highlights
            updateCanvasStateWithShapes(sourceShape, targetShape);
            updateAllMissingConnectionsHighlights(paper);
        };

        // Validate link before it's fully created
        const handleLinkAdd = (linkView: dia.LinkView) => {
            validateSourceCell(linkView);
        };

        // Handle link removal (fires when a link is removed from the graph, e.g., via the remove tool button)
        // Note: We use graph.remove instead of paper.link:remove because it's more reliable and fires at the model level
        const handleGraphRemove = (cell: dia.Cell) => {
            if (cell instanceof dia.Link) {
                // Skip if this is a temporary link being removed during connection creation
                if (skipLinkRemovalRef.current) {
                    skipLinkRemovalRef.current = false; // Reset flag after skipping
                    return;
                }

                const shapes = getShapesFromLink(cell);
                if (!shapes) {
                    return;
                }

                const { sourceShape, targetShape } = shapes;
                const sourceRelationKey = targetShape.getEntityName();
                const targetRelationKey = sourceShape.getEntityName();

                // Remove connections from both shapes
                sourceShape.removeConnection(targetShape.id, sourceRelationKey);
                targetShape.removeConnection(sourceShape.id, targetRelationKey);

                // Update canvas state and highlights
                updateCanvasStateWithShapes(sourceShape, targetShape);
                updateAllMissingConnectionsHighlights(paper);
            }
        };

        paper.on("link:pointerdown", handleLinkPointerDown);
        paper.on("link:add", handleLinkAdd);
        paper.on("link:connect", handleLinkConnect);
        graph.on("remove", handleGraphRemove);

        return () => {
            paper.off("link:pointerdown", handleLinkPointerDown);
            paper.off("link:add", handleLinkAdd);
            paper.off("link:connect", handleLinkConnect);
            graph.off("remove", handleGraphRemove);
        };
    }, [paper, graph, setCanvasState, relationsDictionary]);

    // Update links whenever the canvas state changes (e.g., inventory drops)
    useEffect(() => {
        if (!graph || canvasState.size === 0 || !paper) {
            return;
        }
        createLinksFromCanvasState(canvasState, graph);
        // Also Update missing connections highlights after links are created
        requestAnimationFrame(() => {
            updateAllMissingConnectionsHighlights(paper);
        });
    }, [canvasState, graph, paper]);

    return (
        <ComposerContext.Provider value={{
            ...composerContext,
            mainService: mainService || null,
            serviceCatalog: serviceCatalogQuery.data || [],
            serviceInventories: inventoriesQuery.data || null,
            serviceInstanceId: instanceId || null,
            paper: paper,
            graph: graph,
            scroller: scroller,
            relationsDictionary: relationsDictionary,
            editable: editable,
            canvasState: canvasState,
            setCanvasState: setCanvasState,
            activeCell: activeCell,
            setActiveCell: setActiveCell,
            formState: formState,
            setFormState: setFormState,
        }}>
            <ComposerContainer>
                <LeftSidebar />
                <Canvas />
                <RightSidebar />
            </ComposerContainer>
        </ComposerContext.Provider>
    )
}
