import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useGetServiceModels } from "@inmanta/web-console-core/Queries/Slices/Service";
import {
  useGetInventoryList,
  useGetInstanceWithRelations,
} from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { ComposerContext, composerContext, PaletteItem } from "./Data/Context";
import { createRelationsDictionary, RelationsDictionary } from "./Data/Helpers";
import { useCanvasActions, useComposerInitialization, useServiceOrderItems } from "./Data/Hooks";
import { ServiceEntityShape } from "./Data/ServiceEntityShape";
import { ComposerContainer, Canvas, LeftSidebar, RightSidebar } from "./UI";

/**
 * Props for the top-level Composer component.
 */
interface Props {
  editable: boolean;
  instanceId?: string;
  serviceName: string;
  children?: React.ReactNode;
}

/**
 * Top-level component for the instance composer.
 * Sets up data fetching and the canvas state, and provides composer context to child UI.
 */
export const Composer: React.FC<Props> = ({ editable, instanceId, serviceName, children }) => {
  const [catalogEntries, setCatalogEntries] = useState<string[]>([]);
  const [canvasState, setCanvasState] = useState<Map<string, ServiceEntityShape>>(new Map());
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const draggedItemRef = useRef<PaletteItem | null>(null);

  const serviceCatalogQuery = useGetServiceModels().useContinuousNoRefetch();
  const relationsDictionary: RelationsDictionary = useMemo(
    () => createRelationsDictionary(serviceCatalogQuery.data || []),
    [serviceCatalogQuery.data]
  );

  // We could fetch the main service individually,
  // but since we already have the full catalog, we save a call by filtering it out.
  const mainService = useMemo(
    () => serviceCatalogQuery.data?.find((service) => service.name === serviceName),
    [serviceCatalogQuery.data, serviceName]
  );

  // Only the palette's Inventory tab uses the inventory, and with many instances a response is
  // large: it is fetched when that tab opens, each time, and never polled.
  const [isInventoryRequested, setIsInventoryRequested] = useState(false);
  const inventoriesQuery = useGetInventoryList(catalogEntries).useOneTime(isInventoryRequested);
  const { refetch: refetchInventories } = inventoriesQuery;
  const refreshInventories = useCallback(() => {
    if (isInventoryRequested) {
      void refetchInventories();
    } else {
      // Enabling the query fetches it.
      setIsInventoryRequested(true);
    }
  }, [isInventoryRequested, refetchInventories]);

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
  }, [serviceCatalogQuery.isSuccess, serviceCatalogQuery.data]);

  useComposerInitialization({
    serviceName,
    instanceId,
    serviceCatalog: serviceCatalogQuery.data,
    mainService: mainService,
    relationsDictionary,
    instanceData: instanceWithRelationsQuery.data || null,
    isInstanceDataReady: instanceWithRelationsQuery.isSuccess,
    onCanvasStateInitialized: setCanvasState,
  });

  const canvasActions = useCanvasActions({
    canvasState,
    setCanvasState,
    relationsDictionary,
    serviceCatalog: serviceCatalogQuery.data || [],
  });

  // Use service order items hook for derivation and validation
  const { serviceOrderItems, hasValidationErrors } = useServiceOrderItems({
    canvasState,
  });

  // The active shape is looked up by id, so it drops out once it leaves the canvas.
  const activeCell = (activeCellId && canvasState.get(activeCellId)) || null;
  const setActiveCell = useCallback(
    (cell: ServiceEntityShape | null) => setActiveCellId(cell ? cell.id : null),
    []
  );

  const contextValue = useMemo(
    () => ({
      ...composerContext,
      mainService: mainService || null,
      serviceCatalog: serviceCatalogQuery.data || [],
      serviceInventories: inventoriesQuery.data || null,
      inventoriesError: inventoriesQuery.error?.message ?? null,
      isInventoryLoading: inventoriesQuery.isFetching,
      refreshInventories,
      serviceInstanceId: instanceId || null,
      relationsDictionary: relationsDictionary,
      editable: editable,
      canvasState: canvasState,
      setCanvasState: setCanvasState,
      canvasActions: canvasActions,
      activeCell: activeCell,
      setActiveCell: setActiveCell,
      draggedItemRef: draggedItemRef,
      serviceOrderItems: serviceOrderItems,
      hasValidationErrors: hasValidationErrors,
    }),
    [
      mainService,
      serviceCatalogQuery.data,
      inventoriesQuery.data,
      inventoriesQuery.error,
      inventoriesQuery.isFetching,
      refreshInventories,
      instanceId,
      relationsDictionary,
      editable,
      canvasState,
      canvasActions,
      activeCell,
      setActiveCell,
      serviceOrderItems,
      hasValidationErrors,
    ]
  );

  return (
    <ComposerContext.Provider value={contextValue}>
      <ReactFlowProvider>
        {children || (
          <ComposerContainer id="canvas-wrapper">
            <LeftSidebar />
            <Canvas />
            <RightSidebar />
          </ComposerContainer>
        )}
      </ReactFlowProvider>
    </ComposerContext.Provider>
  );
};
