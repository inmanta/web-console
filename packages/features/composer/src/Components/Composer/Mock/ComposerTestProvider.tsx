import React, { useCallback, useMemo, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { ServiceModel } from "@inmanta/web-console-core";
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
  isInventoryLoading?: boolean;
  refreshInventories?: () => void;
  editable?: boolean;

  /** The selected shape when the canvas opens. */
  activeCellId?: string;

  /** The instance the composer edits, like the editor provides it. */
  serviceInstanceId?: string | null;
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
  isInventoryLoading = false,
  refreshInventories = composerContext.refreshInventories,
  editable = true,
  activeCellId: initialActiveCellId,
  serviceInstanceId = null,
  children,
}) => {
  const relationsDictionary = useMemo(
    () => createRelationsDictionary(serviceCatalog),
    [serviceCatalog]
  );
  const [canvasState, setCanvasState] = useState(shapes);
  const [activeCellId, setActiveCellId] = useState(initialActiveCellId ?? null);
  const draggedItemRef = useRef<PaletteItem | null>(null);
  const canvasActions = useCanvasActions({
    canvasState,
    setCanvasState,
    relationsDictionary,
    serviceCatalog,
  });
  const activeCell = (activeCellId && canvasState.get(activeCellId)) || null;
  const setActiveCell = useCallback(
    (cell: ServiceEntityShape | null) => setActiveCellId(cell ? cell.id : null),
    []
  );

  const value = {
    ...composerContext,
    relationsDictionary,
    serviceCatalog,
    serviceInventories,
    inventoriesError,
    isInventoryLoading,
    refreshInventories,
    editable,
    canvasState,
    setCanvasState,
    canvasActions,
    activeCell,
    setActiveCell,
    draggedItemRef,
    mainService: serviceCatalog[0] ?? null,
    serviceInstanceId,
  };

  return (
    <ComposerContext.Provider value={value}>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </ComposerContext.Provider>
  );
};
