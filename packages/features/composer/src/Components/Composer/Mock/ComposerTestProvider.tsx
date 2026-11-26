import React, { useCallback, useMemo, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import {
  ServiceInstanceModel,
  ServiceModel,
  ServiceOrderItemRequest,
} from "@inmanta/web-console-core";
import { Inventories } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { ComposerContext, composerContext, PaletteItem } from "../Data/Context";
import { createRelationsDictionary } from "../Data/Helpers";
import { useCanvasActions } from "../Data/Hooks";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { serviceCatalog as defaultCatalog } from "./serviceModels";

interface Props {
  /** The shapes on the canvas when it opens. */
  shapes?: Map<string, ServiceEntityShape>;
  serviceCatalog?: ServiceModel[];
  serviceInventories?: Inventories | null;

  /** Why the inventory couldn't be fetched, as the Composer gets it from its query. */
  inventoriesError?: string | null;
  isFetchingInventories?: boolean;
  refetchInventories?: () => void;
  editable?: boolean;

  /** The selected shape when the canvas opens. */
  activeShapeId?: string;

  /** The instance the composer edits or shows, like the composer page provides it. */
  serviceInstance?: ServiceInstanceModel | null;

  /** The order the canvas would deploy; by default none, as the composer derives it. */
  serviceOrderItems?: Map<string, ServiceOrderItemRequest>;
  children: React.ReactNode;
}

/**
 * The composer's context for its component tests, like the Composer provides it, without the
 * queries: the canvas state, the selection and the real canvas actions, and React Flow.
 */
export const ComposerTestProvider: React.FC<Props> = ({
  shapes = new Map(),
  serviceCatalog = defaultCatalog,
  serviceInventories = null,
  inventoriesError = null,
  isFetchingInventories = false,
  refetchInventories = composerContext.refetchInventories,
  editable = true,
  activeShapeId: initialActiveShapeId,
  serviceInstance = null,
  serviceOrderItems = composerContext.serviceOrderItems,
  children,
}) => {
  const relationsDictionary = useMemo(
    () => createRelationsDictionary(serviceCatalog),
    [serviceCatalog]
  );
  const [canvasState, setCanvasState] = useState(shapes);
  const [activeShapeId, setActiveShapeId] = useState(initialActiveShapeId ?? null);
  const draggedItemRef = useRef<PaletteItem | null>(null);
  const canvasActions = useCanvasActions({
    canvasState,
    setCanvasState,
    relationsDictionary,
    serviceCatalog,
  });
  const activeShape = (activeShapeId && canvasState.get(activeShapeId)) || null;
  const setActiveShape = useCallback(
    (shape: ServiceEntityShape | null) => setActiveShapeId(shape ? shape.id : null),
    []
  );

  const value = {
    ...composerContext,
    relationsDictionary,
    serviceCatalog,
    serviceInventories,
    inventoriesError,
    isFetchingInventories,
    refetchInventories,
    editable,
    canvasState,
    setCanvasState,
    canvasActions,
    activeShape,
    setActiveShape,
    draggedItemRef,
    mainService: serviceCatalog[0] ?? null,
    serviceInstance,
    serviceOrderItems,
  };

  return (
    <ComposerContext.Provider value={value}>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </ComposerContext.Provider>
  );
};
