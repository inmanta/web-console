import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
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
  checkIfConnectionIsAllowed,
  countHiddenLayers,
  getConnectedLayerData,
  getLinks,
  getValidationMessages,
} from "../Data/Helpers";
import { useAddPaletteItem } from "../Data/Hooks";
import {
  LEFT_SIDEBAR_WIDTH,
  MAX_ZOOM,
  MIN_ZOOM,
  RIGHT_SIDEBAR_WIDTH,
  SHAPE_WIDTH,
} from "../config";
import { EntityContextMenu } from "./EntityContextMenu";
import { EntityNode, EntityNodeType, HeaderColors } from "./EntityNode";
import { RelationEdge, RelationEdgeType } from "./RelationEdge";

const nodeTypes = { entity: EntityNode };
const edgeTypes = { relation: RelationEdge };
const fitViewOptions = { padding: 0.2, maxZoom: 1 };
const proOptions = { hideAttribution: true };

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
    draggedItemRef,
  } = useContext(ComposerContext);
  const { screenToFlowPosition } = useReactFlow();
  const isConnecting = useStore((state) => state.connection.inProgress);
  const addPaletteItem = useAddPaletteItem();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<EntityNodeType[]>([]);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ shapeId: string; x: number; y: number }>();

  // Rebuild the cards whenever the shapes change. React Flow keeps the size it measured on
  // the previous card, so it is carried over.
  useEffect(() => {
    setNodes((previousNodes) => {
      const measured = new Map(previousNodes.map((node) => [node.id, node.measured]));
      const relationCounts = new Map<string, number>();

      getLinks(canvasState).forEach(({ source, target }) => {
        relationCounts.set(source, (relationCounts.get(source) ?? 0) + 1);
        relationCounts.set(target, (relationCounts.get(target) ?? 0) + 1);
      });

      return Array.from(canvasState.values()).map((shape) => ({
        id: shape.id,
        type: "entity",
        position: shape.position(),
        measured: measured.get(shape.id),
        hidden: shape.isHidden,
        selected: shape.id === activeCell?.id,
        connectable: editable,
        data: {
          shape,
          validationMessages: getValidationMessages(shape, canvasState),
          hiddenCount: countHiddenLayers(canvasState, shape),
          relationCount: relationCounts.get(shape.id) ?? 0,
          hasLayers: getConnectedLayerData(canvasState, shape).shapes.length > 0,
        },
      }));
    });
  }, [canvasState, activeCell, editable]);

  const edges: RelationEdgeType[] = useMemo(
    () =>
      getLinks(canvasState).map((link) => ({
        ...link,
        type: "relation",
        hidden: !!(
          canvasState.get(link.source)?.isHidden || canvasState.get(link.target)?.isHidden
        ),
        selected: link.id === selectedEdgeId,
        data: { isActive: link.id === hoveredEdgeId || link.id === selectedEdgeId },
      })),
    [canvasState, hoveredEdgeId, selectedEdgeId]
  );

  // Moving or measuring a card writes straight to its shape. Neither changes the order,
  // so the canvasState map stays the same and the order items aren't recomputed.
  const onNodesChange = useCallback(
    (changes: NodeChange<EntityNodeType>[]) => {
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          canvasState.get(change.id)?.position(change.position.x, change.position.y);
        }
        if (change.type === "dimensions" && change.dimensions) {
          const shape = canvasState.get(change.id);

          if (shape) {
            shape.size = { ...change.dimensions };
          }
        }
      });

      // Selection follows the active cell, and removing goes through the context menu.
      setNodes((current) =>
        applyNodeChanges(
          changes.filter((change) => change.type !== "select" && change.type !== "remove"),
          current
        )
      );
    },
    [canvasState]
  );

  const isValidConnection = useCallback(
    (link: Connection | Edge) => {
      const source = canvasState.get(link.source);

      return (
        !!source &&
        checkIfConnectionIsAllowed(source, canvasState.get(link.target), relationsDictionary)
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

  const contextMenuShape = contextMenu && canvasState.get(contextMenu.shapeId);

  return (
    <CanvasContainer
      ref={wrapperRef}
      className={`canvas ${!editable && "view_mode"}`}
      data-testid="canvas"
      aria-label={words("instanceComposer.canvas")}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow<EntityNodeType, RelationEdgeType>
        className={isConnecting ? "is-connecting" : undefined}
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
        onEdgeClick={(_event, edge) => setSelectedEdgeId(edge.id)}
        onEdgeMouseEnter={(_event, edge) => setHoveredEdgeId(edge.id)}
        onEdgeMouseLeave={() => setHoveredEdgeId(null)}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        nodesConnectable={editable}
        deleteKeyCode={null}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        fitView
        fitViewOptions={fitViewOptions}
        proOptions={proOptions}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
        <MiniMap
          position="top-right"
          style={{ width: 160, height: 100 }}
          ariaLabel={words("instanceComposer.overview")}
          nodeColor={(node) => HeaderColors[(node as EntityNodeType).data.shape.entityType]}
          pannable
          zoomable
        />
      </ReactFlow>
      {contextMenu && contextMenuShape && (
        <EntityContextMenu
          shape={contextMenuShape}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />
      )}
    </CanvasContainer>
  );
};

const CanvasContainer = styled.div`
  position: relative;
  // Leave room for both flanking sidebars so the canvas never runs under them.
  width: calc(100% - ${LEFT_SIDEBAR_WIDTH + RIGHT_SIDEBAR_WIDTH}px);
  height: 100%;

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
