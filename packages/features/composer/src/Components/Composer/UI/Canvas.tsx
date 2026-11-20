import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  EdgeChange,
  MiniMap,
  NodeChange,
  ReactFlow,
  useReactFlow,
  useStore,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { ComposerContext } from "../Data/Context";
import {
  canRemoveLink,
  checkIfConnectionIsAllowed,
  countHiddenLayers,
  getConnectedLayerData,
  getLinks,
  getRemoveActions,
  getShapeName,
  getValidationMessages,
} from "../Data/Helpers";
import { useAddPaletteItem, useLayoutAxis } from "../Data/Hooks";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import {
  LEFT_SIDEBAR_WIDTH,
  MAX_ZOOM,
  MIN_ZOOM,
  RIGHT_SIDEBAR_WIDTH,
  SHAPE_WIDTH,
} from "../config";
import { EntityContextMenu } from "./EntityContextMenu";
import { EntityNode, EntityNodeData, EntityNodeType } from "./EntityNode";
import { RelationEdge, RelationEdgeType } from "./RelationEdge";
import { entityAccentColors } from "./entityColors";

const nodeTypes = { entity: EntityNode };
const edgeTypes = { relation: RelationEdge };
const fitViewOptions = { padding: 0.2, maxZoom: 1 };
const proOptions = { hideAttribution: true };

/**
 * What each card shows: its shape, and what depends on the other shapes: its problems, what is
 * hidden below it, and its relations. Validating a shape refreshes its attribute validation, so
 * this changes the shapes; it runs once per change of the shapes, not on every render or
 * selection.
 */
const deriveCardData = (canvasState: Map<string, ServiceEntityShape>): EntityNodeData[] => {
  const relationCounts = new Map<string, number>();

  getLinks(canvasState).forEach(({ source, target }) => {
    relationCounts.set(source, (relationCounts.get(source) ?? 0) + 1);
    relationCounts.set(target, (relationCounts.get(target) ?? 0) + 1);
  });

  return Array.from(canvasState.values()).map((shape) => ({
    shape,
    validationMessages: getValidationMessages(shape, canvasState),
    hiddenCount: countHiddenLayers(canvasState, shape),
    relationCount: relationCounts.get(shape.id) ?? 0,
    hasLayers: getConnectedLayerData(canvasState, shape).shapes.length > 0,
  }));
};

/**
 * The composer canvas: the shapes as cards and their relations as lines, on a pannable,
 * zoomable surface. Cards are dragged to move them, clicked to select them, and
 * right-clicked for their menu. Palette items are dropped onto it.
 */
export const Canvas: React.FC = () => {
  const {
    canvasState,
    canvasActions,
    editable,
    activeCell,
    setActiveCell,
    relationsDictionary,
    serviceCatalog,
    serviceInstanceId,
    draggedItemRef,
  } = useContext(ComposerContext);
  const { screenToFlowPosition, flowToScreenPosition, getInternalNode } = useReactFlow();
  const isConnecting = useStore((state) => state.connection.inProgress);
  const addPaletteItem = useAddPaletteItem();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<EntityNodeType[]>([]);

  const { layoutAxis, onCardDragged } = useLayoutAxis(canvasState);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  // Read out by screen readers; a new selection clears it
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => setAnnouncement(""), [selectedEdgeId, activeCell]);
  const ariaLabelConfig = useMemo(getAriaLabelConfig, []);
  const [contextMenu, setContextMenu] = useState<{ shapeId: string; x: number; y: number }>();
  // The card data of the current shapes (deriveCardData)
  const cardDataRef = useRef<{
    canvasState: Map<string, ServiceEntityShape>;
    data: EntityNodeData[];
  }>(null);

  // Rebuild the cards whenever the shapes or the selection change. Only a change of the shapes
  // derives their data again. React Flow keeps the size it measured on the previous card, so it
  // is carried over.
  useEffect(() => {
    if (cardDataRef.current?.canvasState !== canvasState) {
      cardDataRef.current = { canvasState, data: deriveCardData(canvasState) };
    }
    const cardData = cardDataRef.current.data;

    setNodes((previousNodes) => {
      const measured = new Map(previousNodes.map((node) => [node.id, node.measured]));

      return cardData.map((data) => ({
        id: data.shape.id,
        type: "entity",
        position: data.shape.getPosition(),
        measured: measured.get(data.shape.id),
        hidden: data.shape.isHidden,
        selected: data.shape.id === activeCell?.id,
        connectable: editable,
        data,
      }));
    });
  }, [canvasState, activeCell, editable]);

  /**
   * Removes a relation, by its line's button or Delete. The line, which may have had the focus,
   * goes away, so the focus goes back to the canvas.
   */
  const removeRelation = useCallback(
    (source: ServiceEntityShape, target: ServiceEntityShape) => {
      canvasActions.disconnectShapes(source, target);
      setSelectedEdgeId(null);
      wrapperRef.current?.focus();
    },
    [canvasActions]
  );

  const edges: RelationEdgeType[] = useMemo(
    () =>
      getLinks(canvasState).flatMap((link) => {
        const source = canvasState.get(link.source);
        const target = canvasState.get(link.target);

        if (!source || !target) {
          return [];
        }

        return [
          {
            ...link,
            type: "relation" as const,
            hidden: source.isHidden || target.isHidden,
            selected: link.id === selectedEdgeId,
            ariaLabel: words("instanceComposer.link.label")(
              getShapeName(source),
              getShapeName(target)
            ),
            data: {
              isActive: link.id === hoveredEdgeId || link.id === selectedEdgeId,
              layoutAxis,
              onRemove: () => removeRelation(source, target),
            },
          },
        ];
      }),
    [canvasState, hoveredEdgeId, selectedEdgeId, layoutAxis, removeRelation]
  );

  // Moving or measuring a card writes straight to its shape. Neither changes the order,
  // so the canvasState map stays the same and the order items aren't recomputed.
  const onNodesChange = useCallback(
    (changes: NodeChange<EntityNodeType>[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          canvasState.get(change.id)?.setPosition(change.position.x, change.position.y);
          onCardDragged(change.id, change.position);
        }
        if (change.type === "dimensions" && change.dimensions) {
          const shape = canvasState.get(change.id);

          if (shape) {
            shape.size = { ...change.dimensions };
          }
        }
      });

      // Selection follows the active cell: selecting a card with the keyboard (Enter or Space on
      // a focused card) selects its shape, and Escape unselects it. Clicks are handled by
      // onNodeClick and onPaneClick. Removing goes through getRemoveActions (onKeyDown).
      const selections = changes.filter((change) => change.type === "select");
      const selected = selections.filter((change) => change.selected).pop();

      if (selected) {
        setActiveCell(canvasState.get(selected.id) || null);
        setSelectedEdgeId(null);
      } else if (selections.some((change) => change.id === activeCell?.id)) {
        setActiveCell(null);
      }

      setNodes((current) =>
        applyNodeChanges(
          changes.filter((change) => change.type !== "select" && change.type !== "remove"),
          current
        )
      );
    },
    [canvasState, activeCell, setActiveCell, onCardDragged]
  );

  // One selection at a time: a card or a relation line
  const selectEdge = useCallback(
    (edgeId: string) => {
      setSelectedEdgeId(edgeId);
      setActiveCell(null);
    },
    [setActiveCell]
  );

  // A relation line is selected by a click (onEdgeClick) or, when focused, with Enter or Space,
  // which React Flow reports here. Escape unselects it.
  const onEdgesChange = useCallback(
    (changes: EdgeChange<RelationEdgeType>[]) => {
      const selections = changes.filter((change) => change.type === "select");
      const selected = selections.filter((change) => change.selected).pop();

      if (selected) {
        selectEdge(selected.id);
      } else if (selections.length > 0) {
        setSelectedEdgeId((current) =>
          selections.some((change) => change.id === current) ? null : current
        );
      }
    },
    [selectEdge]
  );

  const isValidConnection = useCallback(
    (link: Connection | Edge) => {
      const source = canvasState.get(link.source);

      return (
        !!source &&
        checkIfConnectionIsAllowed(
          source,
          canvasState.get(link.target),
          relationsDictionary,
          canvasState
        )
      );
    },
    [canvasState, relationsDictionary]
  );

  const onConnect = useCallback(
    (link: Connection) => {
      const source = canvasState.get(link.source);
      const target = canvasState.get(link.target);

      if (source && target) {
        canvasActions.connectShapes(source, target);
      }
    },
    [canvasState, canvasActions]
  );

  const closeContextMenu = useCallback(() => setContextMenu(undefined), []);

  /**
   * Gives the focus back to a card after its menu closed, or to the canvas if the card left it.
   * On the next frame, so a removed card is gone by then.
   */
  const focusCard = (shapeId: string) =>
    requestAnimationFrame(() => {
      const card = wrapperRef.current?.querySelector<HTMLElement>(
        `.react-flow__node[data-id="${shapeId}"]`
      );

      (card ?? wrapperRef.current)?.focus();
    });

  const clearSelection = () => {
    setActiveCell(null);
    setSelectedEdgeId(null);
    closeContextMenu();
  };

  const onDragOver = (event: React.DragEvent) => {
    if (draggedItemRef.current) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    }
  };

  const onDrop = (event: React.DragEvent) => {
    const item = draggedItemRef.current;

    if (!item) {
      return;
    }
    event.preventDefault();
    draggedItemRef.current = null;

    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addPaletteItem(item, { x: position.x - SHAPE_WIDTH / 2, y: position.y - 20 });
  };

  /**
   * Delete or Backspace on a selected relation line removes the relation, if the relation allows
   * it, like the line's remove button.
   */
  const removeSelectedRelation = (): boolean => {
    const link = selectedEdgeId && edges.find((edge) => edge.id === selectedEdgeId);
    const source = link && canvasState.get(link.source);
    const target = link && canvasState.get(link.target);

    if (!source || !target) {
      return false;
    }
    if (canRemoveLink(source, target, canvasState, relationsDictionary, serviceCatalog)) {
      removeRelation(source, target);
    } else {
      // Cleared first, so pressing Delete again announces the same message again
      const message = words("instanceComposer.link.cannotRemove")(
        getShapeName(source),
        getShapeName(target)
      );

      setAnnouncement("");
      requestAnimationFrame(() => setAnnouncement(message));
    }

    return true;
  };

  /**
   * Delete or Backspace takes the selected shape off the canvas, by the rules of its menu: a new
   * shape is removed right away. Otherwise the menu opens on the card, to choose between
   * removing the shape from the canvas and deleting it permanently, to undo a staged delete,
   * or to say why it can't be removed.
   */
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (
      (event.key !== "Delete" && event.key !== "Backspace") ||
      !editable ||
      contextMenu ||
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    if (removeSelectedRelation()) {
      event.preventDefault();

      return;
    }
    if (!activeCell) {
      return;
    }
    event.preventDefault();

    const { canRemoveFromCanvas, canDelete } = getRemoveActions(
      activeCell,
      canvasState,
      relationsDictionary,
      serviceCatalog,
      serviceInstanceId
    );

    // Only a new shape is removed right away; an existing instance opens the menu to choose.
    if (canRemoveFromCanvas && !canDelete) {
      canvasActions.removeShape(activeCell);
      setActiveCell(null);
      // Keep the focus in the canvas, where it was on the removed card
      wrapperRef.current?.focus();

      return;
    }

    const node = getInternalNode(activeCell.id);
    const bounds = wrapperRef.current?.getBoundingClientRect();

    if (node && bounds) {
      const corner = flowToScreenPosition(node.internals.positionAbsolute);

      setContextMenu({
        shapeId: activeCell.id,
        x: corner.x - bounds.left + 24,
        y: corner.y - bounds.top + 24,
      });
    }
  };

  const contextMenuShape = contextMenu && canvasState.get(contextMenu.shapeId);

  return (
    <CanvasContainer
      ref={wrapperRef}
      className={editable ? "canvas" : "canvas view_mode"}
      data-testid="canvas"
      tabIndex={-1}
      role="region"
      aria-label={words("instanceComposer.canvas")}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={onKeyDown}
    >
      <ReactFlow<EntityNodeType, RelationEdgeType>
        className={isConnecting ? "is-connecting" : undefined}
        ariaLabelConfig={ariaLabelConfig}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_event, node) => {
          setActiveCell(canvasState.get(node.id) || null);
          setSelectedEdgeId(null);
          closeContextMenu();
        }}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          const bounds = wrapperRef.current?.getBoundingClientRect();

          if (!editable || !bounds) {
            return;
          }
          setContextMenu({
            shapeId: node.id,
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
          });
        }}
        onPaneClick={clearSelection}
        onEdgesChange={onEdgesChange}
        onEdgeClick={(_event, edge) => {
          selectEdge(edge.id);
          closeContextMenu();
        }}
        onEdgeMouseEnter={(_event, edge) => setHoveredEdgeId(edge.id)}
        onEdgeMouseLeave={() => setHoveredEdgeId(null)}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodesConnectable={editable}
        deleteKeyCode={null}
        selectNodesOnDrag={false}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        fitView
        fitViewOptions={fitViewOptions}
        proOptions={proOptions}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
        <MiniMap<EntityNodeType>
          position="top-right"
          style={{ width: 160, height: 100 }}
          ariaLabel={words("instanceComposer.overview")}
          nodeColor={(node) => entityAccentColors[node.data.shape.entityType]}
          pannable
          zoomable
        />
      </ReactFlow>
      {/* Says why Delete didn't remove the selected relation */}
      <span className="screen-reader-only" role="status">
        {announcement}
      </span>
      {contextMenu && contextMenuShape && (
        <EntityContextMenu
          shape={contextMenuShape}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={(restoreFocus) => {
            closeContextMenu();
            if (restoreFocus) {
              focusCard(contextMenu.shapeId);
            }
          }}
        />
      )}
    </CanvasContainer>
  );
};

/**
 * What the cards and lines tell screen readers they do, instead of React Flow's default, which
 * says Delete always removes them.
 */
const getAriaLabelConfig = () => ({
  // React Flow reads "keyboardDisabled" while keyboard access is on (it is, here), and "default"
  // while it is off; the names are the other way round.
  "node.a11yDescription.keyboardDisabled": words("instanceComposer.canvas.cardDescription"),
  "node.a11yDescription.default": words("instanceComposer.canvas.cardDescription"),
  "edge.a11yDescription.default": words("instanceComposer.canvas.lineDescription"),
});

const CanvasContainer = styled.div`
  .screen-reader-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  position: relative;
  // Leave room for both flanking sidebars so the canvas never runs under them.
  width: calc(100% - ${LEFT_SIDEBAR_WIDTH + RIGHT_SIDEBAR_WIDTH}px);
  height: 100%;

  // Only focused when the focused card is removed, to keep the focus in the canvas
  &:focus {
    outline: none;
  }

  // The left sidebar is hidden in view mode, so only reserve the right sidebar.
  &.view_mode {
    width: calc(100% - ${RIGHT_SIDEBAR_WIDTH}px);
  }

  .react-flow {
    --xy-background-color: var(--pf-t--global--background--color--secondary--default);
    --xy-background-pattern-color: var(--pf-t--global--border--color--default);
    --xy-minimap-background-color: var(--pf-t--global--background--color--primary--default);
    --xy-minimap-mask-background-color: var(--pf-t--global--background--color--secondary--default);
    --xy-connectionline-stroke: var(--pf-t--global--border--color--brand--default);
    --xy-edge-stroke: var(--pf-t--global--icon--color--subtle);
    --xy-edge-stroke-selected: var(--pf-t--global--border--color--brand--default);
    font-family: var(--pf-t--global--font--family--body);
  }

  // While a link is dragged, every card is a drop target.
  .react-flow.is-connecting .entity-target-handle {
    pointer-events: all;
  }

  .react-flow__connection-path {
    stroke-width: 2;
    stroke-dasharray: 6 4;
  }

  .react-flow__edge .relation-edge {
    stroke-width: 1.5;
  }

  .relation-edge-end {
    fill: var(--xy-edge-stroke);
  }

  .react-flow__edge.selected .relation-edge-end {
    fill: var(--xy-edge-stroke-selected);
  }

  .react-flow__minimap {
    border-radius: var(--pf-t--global--border--radius--medium);
    box-shadow: var(--pf-t--global--box-shadow--md);
    overflow: hidden;
  }
`;
