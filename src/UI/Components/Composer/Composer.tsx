import { useGetInventoryList, useGetServiceModels, useGetInstanceWithRelations } from "@/Data/Queries";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ComposerContext, composerContext } from "./Data/Context";
import { ComposerContainer, Canvas, LeftSidebar, RightSidebar, ZoomControls } from "./UI";
import { dia, shapes, ui } from "@inmanta/rappid";
import { ComposerPaper } from "./UI/JointJsShapes/ComposerPaper";
import { LinkShape } from "./UI/JointJsShapes/LinkShape";
import {
    createRelationsDictionary,
    RelationsDictionary,
    initializeCanvasFromInstance,
    createPlaceholderInstance,
    applyCoordinatesFromMetadata,
    applyAutoLayoutToEmbeddedEntities,
    createLinksFromCanvasState,
    isServiceEntityShapeCell,
    canvasStateToServiceOrderItems,
    createLinkShape,
    addConnectionsBetweenShapes,
    removeConnectionsBetweenShapes,
} from "./Data/Helpers";
import { toggleDisabledSidebarItem } from "./Data/Helpers/disableSidebarItem";
import { ServiceEntityShape } from "./UI";
import { createHalo, updateAllMissingConnectionsHighlights } from "./UI/JointJsShapes/createHalo";
import { InstanceAttributeModel } from "@/Core";
import { createCanvasHandlers } from "./Data/CanvasHandlers";
import { ComposerServiceOrderItem } from "./Data/Helpers/deploymentHelpers";

interface Props {
    editable: boolean;
    instanceId?: string;
    serviceName: string;
    children?: React.ReactNode;
}

export const Composer: React.FC<Props> = ({ editable, instanceId, serviceName, children }) => {
    const [catalogEntries, setCatalogEntries] = useState<string[]>([]);
    const [canvasState, setCanvasState] = useState<Map<string, ServiceEntityShape>>(new Map());
    const [activeCell, setActiveCell] = useState<ServiceEntityShape | null>(null);
    const [formState, setFormState] = useState<InstanceAttributeModel>({});
    const [serviceOrderItems, setServiceOrderItems] = useState<Map<string, ComposerServiceOrderItem>>(new Map());
    const haloRef = useRef<ui.Halo | null>(null);
    const contextMenuRef = useRef<HTMLElement | null>(null);
    const skipLinkRemovalRef = useRef(false);
    const initializationKeyRef = useRef<string | null>(null);
    const initialShapeInfoRef = useRef<Map<string, { service_entity: string }>>(new Map()); // Track initial shape info for delete detection
    const serviceCatalogQuery = useGetServiceModels().useContinuousNoRefetch();
    const relationsDictionary: RelationsDictionary = useMemo(() => createRelationsDictionary(serviceCatalogQuery.data || []), [serviceCatalogQuery.data]);

    // We could fetch the main service individually, 
    // but since we already have the full catalog, we save a call by filtering it out.
    const mainService = useMemo(() =>
        serviceCatalogQuery.data?.find((service) => service.name === serviceName),
        [serviceCatalogQuery.data, serviceName]
    );

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

    // Create canvas handlers
    const canvasHandlers = useMemo(() => createCanvasHandlers(graph), [graph]);

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

        // Track initial shape info for delete detection (only for existing instances, not new ones)
        if (instanceId) {
            const initialShapeInfo = new Map<string, { service_entity: string }>();
            initializedEntities.forEach((shape, id) => {
                initialShapeInfo.set(id, { service_entity: shape.getEntityName() });
            });
            initialShapeInfoRef.current = initialShapeInfo;
        } else {
            initialShapeInfoRef.current = new Map();
        }

        // Apply coordinates from metadata if available, otherwise use default layout
        const metadataCoordinates = instanceData.instance.metadata?.coordinates;
        if (metadataCoordinates) {
            try {
                const parsedMetadata = JSON.parse(metadataCoordinates);
                if (parsedMetadata.version === "v2" && parsedMetadata.data) {
                    // Apply saved coordinates from metadata (overrides manual positioning)
                    // This only applies to core and relation entities, not embedded entities
                    applyCoordinatesFromMetadata(graph, parsedMetadata.data);
                }
            } catch (error) {
                console.warn("Failed to parse coordinates from metadata:", error);
            }
        }
        // Always apply autolayout to embedded entities to position them near their parents
        // Embedded entities can't be targetted by ids since they don't have any persistent ids.
        applyAutoLayoutToEmbeddedEntities(graph);

        // Unfreeze paper if it's frozen
        if (paper.isFrozen()) {
            paper.unfreeze();
        }

        // Fit content to screen by default
        // Use requestAnimationFrame to ensure paper is fully rendered before fitting
        requestAnimationFrame(() => {
            scroller.zoomToFit({ useModelGeometry: true, padding: 20 });
        });

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

    // Wire up click events on paper and enable panning
    useEffect(() => {
        if (!paper || !graph || !scroller) {
            return;
        }

        // Handle clicks on empty canvas space - clear the form and halo
        // This fires on pointerup, so it only clears if user clicked (not dragged)
        const handleBlankClick = () => {
            haloRef.current?.remove();
            haloRef.current = null;
            setActiveCell(null);
            setFormState({});
        };

        // Start panning when user clicks and drags on blank canvas
        const handleBlankPointerDown = (event: dia.Event) => {
            if (event) {
                scroller.startPanning(event);
            }
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

        // Handle right-click context menu on entity shapes
        const handleCellContextMenu = (cellView: dia.CellView, event: dia.Event) => {
            const cell = cellView.model;
            // Only handle ServiceEntityShape, not links
            if (cell instanceof dia.Link) {
                return;
            }

            if (!isServiceEntityShapeCell(cell)) {
                return;
            }

            // Prevent default browser context menu
            const originalEvent = event.originalEvent as MouseEvent;
            if (originalEvent) {
                originalEvent.preventDefault();
                originalEvent.stopPropagation();
            }

            // Remove any existing context menu
            if (contextMenuRef.current) {
                contextMenuRef.current.remove();
                contextMenuRef.current = null;
            }

            // Create context menu element
            const menu = document.createElement("div");
            menu.className = "entity-context-menu";

            // Close menu and cleanup
            const closeMenuAndCleanup = () => {
                menu.remove();
                contextMenuRef.current = null;
            };

            // Clear active cell if it matches the clicked cell
            const clearActiveCellIfMatch = () => {
                if (haloRef.current && activeCell?.id === cell.id) {
                    handleBlankClick();
                }
            };

            // Create remove menu item (always available)
            const removeMenuItem = document.createElement("div");
            removeMenuItem.className = "entity-context-menu-item";
            removeMenuItem.textContent = "Remove";
            removeMenuItem.onclick = () => {
                clearActiveCellIfMatch();

                // We only want to remove the shape from the canvas,
                // not send a delete API request for it.
                // canvasStateToServiceOrderItems uses initialShapeInfoRef to determine
                // which shapes should be turned into delete order items.
                // By removing this id from initialShapeInfoRef, we prevent a delete
                // order item from being generated for this shape.
                initialShapeInfoRef.current.delete(cell.id as string);

                // Removing the cell will also remove all connected links.
                // The graph `remove` handler takes care of cleaning up connections
                // and updating canvasState for all affected shapes.
                cell.remove();

                closeMenuAndCleanup();
            };
            menu.appendChild(removeMenuItem);

            // Only core and relation entities can be permanently deleted
            if (cell.entityType === "core" || cell.entityType === "relation") {
                const deletePermanentlyMenuItem = document.createElement("div");
                deletePermanentlyMenuItem.className = "entity-context-menu-item";
                deletePermanentlyMenuItem.textContent = "Delete permanently";
                deletePermanentlyMenuItem.onclick = () => {
                    clearActiveCellIfMatch();

                    // Delete permanently: remove the shape from the canvas and mark it for deletion.
                    // By keeping this id in initialShapeInfoRef (not deleting it), 
                    // canvasStateToServiceOrderItems will generate a delete order item
                    // which will send a delete API request for this shape.
                    // Note: If the shape wasn't in initialShapeInfoRef, it means it was newly added,
                    // so there's nothing to delete on the server - just removing it is sufficient.

                    // Removing the cell will also remove all connected links.
                    // The graph `remove` handler takes care of cleaning up connections
                    // and updating canvasState for all affected shapes.
                    cell.remove();

                    closeMenuAndCleanup();
                };
                menu.appendChild(deletePermanentlyMenuItem);
            }

            // Position menu at click location
            if (originalEvent && scroller) {
                const scrollerEl = scroller.el;
                const rect = scrollerEl.getBoundingClientRect();
                menu.style.left = `${originalEvent.clientX - rect.left + scrollerEl.scrollLeft}px`;
                menu.style.top = `${originalEvent.clientY - rect.top + scrollerEl.scrollTop}px`;
                scrollerEl.appendChild(menu);
                contextMenuRef.current = menu;
            }

            // Close menu when clicking outside
            const closeMenu = (e: MouseEvent) => {
                if (menu && !menu.contains(e.target as Node)) {
                    menu.remove();
                    contextMenuRef.current = null;
                    document.removeEventListener("mousedown", closeMenu);
                }
            };
            setTimeout(() => {
                document.addEventListener("mousedown", closeMenu);
            }, 0);
        };

        paper.on("blank:pointerdown", handleBlankPointerDown);
        paper.on("blank:pointerup", handleBlankClick);
        paper.on("cell:pointerup", handleCellClick);
        paper.on("cell:contextmenu", handleCellContextMenu);

        return () => {
            paper.off("blank:pointerdown", handleBlankPointerDown);
            paper.off("blank:pointerup", handleBlankClick);
            paper.off("cell:pointerup", handleCellClick);
            paper.off("cell:contextmenu", handleCellContextMenu);
            if (contextMenuRef.current) {
                contextMenuRef.current.remove();
                contextMenuRef.current = null;
            }
        };
    }, [paper, graph, scroller, editable, relationsDictionary]);


    useEffect(() => {
        if (!paper || !graph) {
            return;
        }

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

        // Helper function to update canvas state with two shapes
        const updateCanvasStateWithShapes = (sourceShape: ServiceEntityShape, targetShape: ServiceEntityShape) => {
            setCanvasState((prev) => {
                const updated = new Map(prev);
                updated.set(sourceShape.id, sourceShape);
                updated.set(targetShape.id, targetShape);
                return updated;
            });
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

            // Add connections to both shapes
            addConnectionsBetweenShapes(sourceShape, targetShape);

            // Replace temporary link with a persistent LinkShape so routing/magnets behave the same
            skipLinkRemovalRef.current = true;
            linkView.model.remove();

            const link = createLinkShape(sourceShape, targetShape, paper);
            link.addTo(graph);

            // Update canvas state and highlights
            updateCanvasStateWithShapes(sourceShape, targetShape);
            updateAllMissingConnectionsHighlights(paper);
        };

        // Validate link before it's fully created
        const handleLinkAdd = (linkView: dia.LinkView) => {
            validateSourceCell(linkView);
        };

        // Handle cell removal (fires when a cell is removed from the graph, e.g., via delete action)
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

                // Remove connections from both shapes
                removeConnectionsBetweenShapes(sourceShape, targetShape);

                // Update canvas state and highlights
                updateCanvasStateWithShapes(sourceShape, targetShape);
                updateAllMissingConnectionsHighlights(paper);
            } else if (isServiceEntityShapeCell(cell)) {
                // Shape was removed from canvas - update canvasState
                setCanvasState((prev) => {
                    const newState = new Map(prev);
                    newState.delete(cell.id as string);
                    return newState;
                });

                // If an inter-service relation instance was removed from the canvas (but not deleted permanently),
                // re-enable its corresponding sidebar item so it can be added again.
                //
                // We distinguish "remove from canvas" from "delete permanently" using initialShapeInfoRef:
                // - For a simple remove, the context menu handler deletes the id from initialShapeInfoRef
                //   before calling cell.remove(), so `has(id)` will be false here.
                // - For "Delete permanently", the id is kept in initialShapeInfoRef, so `has(id)` will be true
                //   and the sidebar item remains disabled.
                if (
                    cell.entityType === "relation" &&
                    !initialShapeInfoRef.current.has(cell.id as string)
                ) {
                    toggleDisabledSidebarItem(cell.id as string, false);
                }

                // Update highlights after shape removal
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

    // Update serviceOrderItems when canvasState changes
    useEffect(() => {
        if (canvasState.size > 0 || initialShapeInfoRef.current.size > 0) {
            const orderItems = canvasStateToServiceOrderItems(
                canvasState,
                initialShapeInfoRef.current,
                serviceCatalogQuery.data || []
            );
            setServiceOrderItems(orderItems);
        } else {
            setServiceOrderItems(new Map());
        }
    }, [canvasState, serviceCatalogQuery.data]);

    // Check for validation errors (missing required connections or attributes on any shape)
    const hasValidationErrors = useMemo(() => {
        if (canvasState.size === 0) {
            return false;
        }

        // Check if any shape has missing connections or attribute validation errors
        for (const shape of canvasState.values()) {
            // Ensure attribute validation state is up to date
            shape.validateAttributes();

            if (shape.isMissingConnections() || shape.hasAttributeValidationErrors) {
                return true;
            }
        }

        return false;
    }, [canvasState]);

    const contextValue = useMemo(() => ({
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
        canvasHandlers: canvasHandlers,
        setCanvasHandlers: () => { },
        serviceOrderItems: serviceOrderItems,
        setServiceOrderItems: setServiceOrderItems,
        hasValidationErrors: hasValidationErrors,
    }), [
        mainService,
        serviceCatalogQuery.data,
        inventoriesQuery.data,
        instanceId,
        paper,
        graph,
        scroller,
        relationsDictionary,
        editable,
        canvasState,
        setCanvasState,
        activeCell,
        setActiveCell,
        formState,
        setFormState,
        canvasHandlers,
        serviceOrderItems,
        setServiceOrderItems,
        hasValidationErrors,
    ]);

    return (
        <ComposerContext.Provider value={contextValue}>
            {children || (
                <ComposerContainer id="canvas-wrapper">
                    <LeftSidebar />
                    <Canvas />
                    <RightSidebar />
                    <ZoomControls />
                </ComposerContainer>
            )}
        </ComposerContext.Provider>
    )
}
