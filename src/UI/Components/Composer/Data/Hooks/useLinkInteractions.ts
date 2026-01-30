import { useEffect, useRef } from "react";
import { dia } from "@inmanta/rappid";
import { ServiceModel } from "@/Core";
import { ServiceEntityShape } from "../../UI";
import { updateAllMissingConnectionsHighlights } from "../../UI/JointJsShapes/createHalo";
import { CanvasHandlers } from "../CanvasHandlers";
import { isServiceEntityShapeCell } from "../Helpers";
import {
  createLinkShape,
  addConnectionsBetweenShapes,
  removeConnectionsBetweenShapes,
  createLinksFromCanvasState,
} from "../Helpers";
import { RelationsDictionary } from "../Helpers/createRelationsDictionary";
import { toggleDisabledSidebarItem } from "../Helpers/disableSidebarItem";
import { canRemoveLink } from "../Helpers/relationsHelpers";

interface UseLinkInteractionsParams {
  paper: dia.Paper | null;
  graph: dia.Graph | null;
  canvasHandlers: CanvasHandlers;
  canvasState: Map<string, ServiceEntityShape>;
  setCanvasState: React.Dispatch<React.SetStateAction<Map<string, ServiceEntityShape>>>;
  initialShapeInfoRef: React.MutableRefObject<Map<string, { service_entity: string }>>;
  relationsDictionary: RelationsDictionary;
  serviceCatalog: ServiceModel[];
}

/**
 * Hook for managing link interactions: creation, connection, and removal.
 * Handles all link-related events including validation, connection management,
 * and updating canvas state when links are added or removed.
 */
export const useLinkInteractions = ({
  paper,
  graph,
  canvasHandlers,
  canvasState,
  setCanvasState,
  initialShapeInfoRef,
  relationsDictionary,
  serviceCatalog,
}: UseLinkInteractionsParams): void => {
  const skipLinkRemovalRef = useRef(false);

  useEffect(() => {
    if (!paper || !graph) {
      return;
    }

    // Helper function to update canvas state with two shapes
    const updateCanvasStateWithShapes = (
      sourceShape: ServiceEntityShape,
      targetShape: ServiceEntityShape
    ) => {
      setCanvasState((prev) => {
        const updated = new Map(prev);
        updated.set(sourceShape.id, sourceShape);
        updated.set(targetShape.id, targetShape);
        return updated;
      });
    };

    /**
     * Intercepts link creation and ensures the source shape is valid.
     * Fires when user starts dragging a link from a shape.
     */
    const handleLinkPointerDown = (linkView: dia.LinkView) => {
      canvasHandlers.getValidSourceShape(linkView);
    };

    /**
     * Ensures the source shape is still valid before the link is fully created.
     * Fires when a link is added to the graph.
     */
    const handleLinkAdd = (linkView: dia.LinkView) => {
      canvasHandlers.getValidSourceShape(linkView);
    };

    /**
     * Handles link connection when user connects a link to a target shape.
     * Validates the connection bidirectionally, adds connections to both shapes,
     * and replaces the temporary link with a persistent LinkShape.
     */
    const handleLinkConnect = (linkView: dia.LinkView) => {
      const shapes = canvasHandlers.getShapesFromLink(linkView.model);
      if (!shapes) {
        linkView.remove();
        return;
      }

      const { sourceShape, targetShape } = shapes;

      // Validate connection bidirectionally (already validated in paper.validateConnection, but double-check here)
      if (
        !sourceShape.validateConnection(targetShape) ||
        !targetShape.validateConnection(sourceShape)
      ) {
        linkView.remove();
        return;
      }

      // Add connections to both shapes
      addConnectionsBetweenShapes(sourceShape, targetShape);

      // Replace temporary link with a persistent LinkShape so routing/magnets behave consistently
      skipLinkRemovalRef.current = true;
      linkView.model.remove();

      const link = createLinkShape(sourceShape, targetShape, paper);
      link.addTo(graph);

      // Update canvas state and highlights
      updateCanvasStateWithShapes(sourceShape, targetShape);
      updateAllMissingConnectionsHighlights(paper);
    };

    /**
     * Handles cell removal from the graph.
     * For links: validates removal, removes connections, and updates state.
     * For shapes: updates canvas state and handles sidebar item re-enabling.
     */
    const handleGraphRemove = (cell: dia.Cell) => {
      if (cell instanceof dia.Link) {
        // Skip if this is a temporary link being removed during connection creation
        if (skipLinkRemovalRef.current) {
          skipLinkRemovalRef.current = false; // Reset flag after skipping
          return;
        }

        const shapes = canvasHandlers.getShapesFromLink(cell);
        if (!shapes) {
          return;
        }

        const { sourceShape, targetShape } = shapes;

        // Validate if the link can be removed (fallback validation for programmatic removals)
        // Note: UI-initiated removals via removeTool are validated in ComposerPaper.ts
        if (
          !graph ||
          !canRemoveLink(sourceShape, targetShape, graph, relationsDictionary, serviceCatalog)
        ) {
          // Prevent removal by re-adding the link to the graph
          cell.addTo(graph);
          return;
        }

        // Remove connections from both shapes
        removeConnectionsBetweenShapes(sourceShape, targetShape);

        // Update canvas state and highlights
        updateCanvasStateWithShapes(sourceShape, targetShape);
        updateAllMissingConnectionsHighlights(paper);
      } else if (isServiceEntityShapeCell(cell)) {
        const removedShape = cell as ServiceEntityShape;
        const removedShapeId = removedShape.id as string;
        const removedEntityType = removedShape.getEntityName();

        // Find all connected shapes using the removed shape's connections map
        // (This is more reliable than using graph.getLinks() since links may already be removed)
        const connectedShapes = new Set<ServiceEntityShape>();

        // Iterate through all connection types in the removed shape's connections map
        for (const [_relationType, connectionIds] of removedShape.connections.entries()) {
          for (const connectedId of connectionIds) {
            const connectedShape = graph.getCell(connectedId) as ServiceEntityShape | undefined;
            if (connectedShape) {
              connectedShapes.add(connectedShape);
              // Remove this shape's ID from the connected shape's connections map
              connectedShape.removeConnection(removedShapeId, removedEntityType);
            }
          }
        }

        // Explicitly remove all links connected to this shape
        // JointJS should do this automatically when a cell is removed, but we ensure it happens
        graph.removeLinks(removedShape);

        // Update canvas state for all affected shapes
        setCanvasState((prev) => {
          const newState = new Map(prev);
          newState.delete(removedShapeId);

          // Update all connected shapes in canvas state
          for (const connectedShape of connectedShapes) {
            newState.set(connectedShape.id, connectedShape);
          }

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
          removedShape.entityType === "relation" &&
          !initialShapeInfoRef.current.has(removedShapeId)
        ) {
          toggleDisabledSidebarItem(removedShapeId, false);
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
  }, [
    paper,
    graph,
    canvasHandlers,
    setCanvasState,
    initialShapeInfoRef,
    relationsDictionary,
    serviceCatalog,
  ]);

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
};
