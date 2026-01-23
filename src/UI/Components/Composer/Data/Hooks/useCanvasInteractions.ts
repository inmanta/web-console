import { useEffect, useRef } from "react";
import { dia, ui } from "@inmanta/rappid";
import { InstanceAttributeModel } from "@/Core";
import { ServiceModel } from "@/Core";
import { words } from "@/UI/words";
import { ServiceEntityShape } from "../../UI";
import { createHalo } from "../../UI/JointJsShapes/createHalo";
import { RelationsDictionary } from "../Helpers";
import { isServiceEntityShapeCell } from "../Helpers";
import { canRemoveShape } from "../Helpers/relationsHelpers";

interface UseCanvasInteractionsParams {
  paper: dia.Paper | null;
  graph: dia.Graph | null;
  scroller: ui.PaperScroller | null;
  editable: boolean;
  relationsDictionary: RelationsDictionary;
  activeCell: ServiceEntityShape | null;
  setActiveCell: (cell: ServiceEntityShape | null) => void;
  setFormState: (state: InstanceAttributeModel) => void;
  initialShapeInfoRef: React.MutableRefObject<Map<string, { service_entity: string }>>;
  serviceCatalog: ServiceModel[];
}

/**
 * Hook for managing canvas interactions: clicks, context menu, and halo display.
 * Handles user interactions with shapes on the canvas including selection,
 * context menu operations, and panning.
 */
export const useCanvasInteractions = ({
  paper,
  graph,
  scroller,
  editable,
  relationsDictionary,
  activeCell,
  setActiveCell,
  setFormState,
  initialShapeInfoRef,
  serviceCatalog,
}: UseCanvasInteractionsParams): void => {
  const haloRef = useRef<ui.Halo | null>(null);
  const contextMenuRef = useRef<HTMLElement | null>(null);

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

      // Check if the shape can be removed
      const canRemove = graph
        ? canRemoveShape(cell, graph, relationsDictionary, serviceCatalog)
        : true;

      // Create remove menu item (only show if removal is allowed)
      if (canRemove) {
        const removeMenuItem = document.createElement("div");
        removeMenuItem.className = "entity-context-menu-item";
        removeMenuItem.textContent = "Remove from canvas";
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
      }

      // Only core and relation entities can be permanently deleted (only show if removal is allowed and shape is not new)
      // New shapes haven't been persisted yet, so there's nothing to delete permanently
      if (
        (cell.entityType === "core" || cell.entityType === "relation") &&
        canRemove &&
        !cell.isNew
      ) {
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

      // If no menu items were added, show a fallback message
      if (menu.children.length === 0) {
        const fallbackMessage = document.createElement("div");
        fallbackMessage.className = "entity-context-menu-item";
        fallbackMessage.style.cursor = "default";
        fallbackMessage.style.opacity = "0.7";
        fallbackMessage.textContent = words("instanceComposer.contextMenu.cannotRemove");
        menu.appendChild(fallbackMessage);
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
  }, [
    paper,
    graph,
    scroller,
    editable,
    relationsDictionary,
    activeCell,
    setActiveCell,
    setFormState,
    initialShapeInfoRef,
    serviceCatalog,
  ]);
};
