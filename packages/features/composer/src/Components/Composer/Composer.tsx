import React, { useCallback, useMemo, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { ServiceModel } from "@inmanta/web-console-core";
import {
  InstanceWithRelations,
  useGetInventoryList,
} from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { ComposerContext, composerContext, PaletteItem } from "./Data/Context";
import { createRelationsDictionary, RelationsDictionary } from "./Data/Helpers";
import { useCanvasActions, useComposerInitialization, useServiceOrderItems } from "./Data/Hooks";
import { ServiceEntityShape } from "./Data/ServiceEntityShape";
import { ComposerContainer, Canvas, LeftSidebar, RightSidebar } from "./UI";

/**
 * Props for the top-level Composer component. The composer page (ComposerPage) loads the data.
 */
interface Props {
  editable: boolean;

  /** The whole service catalog: the services the canvas can hold, and their relations. */
  serviceCatalog: ServiceModel[];

  /** The service of the instance being composed. */
  mainService: ServiceModel;

  /** The instance being edited or viewed, with its related instances; none for a new instance. */
  instance?: InstanceWithRelations;
  children?: React.ReactNode;
}

/**
 * Top-level component for the instance composer.
 * Sets up the canvas state and provides the composer context to the child UI. It only fetches the
 * inventory, when the palette asks for it.
 */
export const Composer: React.FC<Props> = ({
  editable,
  serviceCatalog,
  mainService,
  instance,
  children,
}) => {
  const [canvasState, setCanvasState] = useState<Map<string, ServiceEntityShape>>(new Map());
  const [activeShapeId, setActiveShapeId] = useState<string | null>(null);
  const draggedItemRef = useRef<PaletteItem | null>(null);
  const instanceId = instance?.instance.id;

  const relationsDictionary: RelationsDictionary = useMemo(
    () => createRelationsDictionary(serviceCatalog),
    [serviceCatalog]
  );
  const catalogEntries = useMemo(() => serviceCatalog.map(({ name }) => name), [serviceCatalog]);

  const [isInventoryRequested, setIsInventoryRequested] = useState(false);
  const inventoriesQuery = useGetInventoryList(catalogEntries).useOneTime(isInventoryRequested);
  const { refetch: refetchInventoryQuery } = inventoriesQuery;
  const refetchInventories = useCallback(() => {
    if (isInventoryRequested) {
      void refetchInventoryQuery();
    } else {
      // Enabling the query fetches it.
      setIsInventoryRequested(true);
    }
  }, [isInventoryRequested, refetchInventoryQuery]);

  useComposerInitialization({
    serviceName: mainService.name,
    instanceId,
    serviceCatalog,
    mainService,
    relationsDictionary,
    instanceData: instance ?? null,
    isInstanceDataReady: instance !== undefined,
    onCanvasStateInitialized: setCanvasState,
  });

  const canvasActions = useCanvasActions({
    canvasState,
    setCanvasState,
    relationsDictionary,
    serviceCatalog,
  });

  // Use service order items hook for derivation and validation
  const { serviceOrderItems, hasValidationErrors } = useServiceOrderItems({
    canvasState,
  });

  // The active shape is looked up by id, so it drops out once it leaves the canvas.
  const activeShape = (activeShapeId && canvasState.get(activeShapeId)) || null;
  const setActiveShape = useCallback(
    (shape: ServiceEntityShape | null) => setActiveShapeId(shape ? shape.id : null),
    []
  );

  const contextValue = useMemo(
    () => ({
      ...composerContext,
      mainService,
      serviceCatalog,
      serviceInventories: inventoriesQuery.data || null,
      inventoriesError: inventoriesQuery.error?.message ?? null,
      isFetchingInventories: inventoriesQuery.isFetching,
      refetchInventories,
      serviceInstanceId: instanceId || null,
      serviceInstance: instance?.instance ?? null,
      relationsDictionary: relationsDictionary,
      editable: editable,
      canvasState: canvasState,
      setCanvasState: setCanvasState,
      canvasActions: canvasActions,
      activeShape: activeShape,
      setActiveShape: setActiveShape,
      draggedItemRef: draggedItemRef,
      serviceOrderItems: serviceOrderItems,
      hasValidationErrors: hasValidationErrors,
    }),
    [
      mainService,
      serviceCatalog,
      inventoriesQuery.data,
      inventoriesQuery.error,
      inventoriesQuery.isFetching,
      refetchInventories,
      instanceId,
      instance,
      relationsDictionary,
      editable,
      canvasState,
      canvasActions,
      activeShape,
      setActiveShape,
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
