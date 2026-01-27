import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InstanceAttributeModel } from "@/Core";
import {
  useGetInventoryList,
  useGetServiceModels,
  useGetInstanceWithRelations,
} from "@/Data/Queries";
import { createCanvasHandlers } from "./Data/CanvasHandlers";
import { ComposerContext, composerContext } from "./Data/Context";
import { createRelationsDictionary, RelationsDictionary } from "./Data/Helpers";
import {
  useComposerGraph,
  useCanvasInteractions,
  useLinkInteractions,
  useServiceOrderItems,
} from "./Data/Hooks";
import { ServiceEntityShape } from "./UI";
import { ComposerContainer, Canvas, LeftSidebar, RightSidebar, ZoomControls } from "./UI";

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
 * Sets up data fetching, JointJS graph/paper, and provides composer context to child UI.
 */
export const Composer: React.FC<Props> = ({ editable, instanceId, serviceName, children }) => {
  const [catalogEntries, setCatalogEntries] = useState<string[]>([]);
  const [canvasState, setCanvasState] = useState<Map<string, ServiceEntityShape>>(new Map());
  const [activeCell, setActiveCell] = useState<ServiceEntityShape | null>(null);
  const [_formState, setFormState] = useState<InstanceAttributeModel>({});
  const initialShapeInfoRef = useRef<Map<string, { service_entity: string }>>(new Map()); // Track initial shape info for delete detection

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

  const inventoriesQuery = useGetInventoryList(catalogEntries).useContinuousNoRefetch();

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

  // Stable callback for tracking initial shape info
  const handleInitialShapeInfoTracked = useCallback(
    (shapeInfo: Map<string, { service_entity: string }>) => {
      initialShapeInfoRef.current = shapeInfo;
    },
    []
  );

  // Use composer graph hook for graph/paper/scroller setup and initialization
  const { graph, paper, scroller } = useComposerGraph({
    editable,
    serviceName,
    instanceId,
    serviceCatalog: serviceCatalogQuery.data,
    mainService: mainService,
    relationsDictionary,
    instanceData: instanceWithRelationsQuery.data || null,
    isInstanceDataReady: instanceWithRelationsQuery.isSuccess,
    onCanvasStateInitialized: setCanvasState,
    onInitialShapeInfoTracked: handleInitialShapeInfoTracked,
  });

  // Create canvas handlers
  const canvasHandlers = useMemo(() => createCanvasHandlers(graph), [graph]);

  // Use canvas interactions hook for click events, context menu, and halo
  useCanvasInteractions({
    paper,
    graph,
    scroller,
    editable,
    relationsDictionary,
    activeCell,
    setActiveCell,
    setFormState,
    initialShapeInfoRef,
    serviceCatalog: serviceCatalogQuery.data || [],
  });

  // Use link interactions hook for link creation, connection, and removal
  useLinkInteractions({
    paper,
    graph,
    canvasHandlers,
    canvasState,
    setCanvasState,
    initialShapeInfoRef,
    relationsDictionary,
    serviceCatalog: serviceCatalogQuery.data || [],
  });

  // Use service order items hook for derivation and validation
  const { serviceOrderItems, hasValidationErrors } = useServiceOrderItems({
    canvasState,
    initialShapeInfoRef,
    serviceCatalog: serviceCatalogQuery.data,
  });

  const contextValue = useMemo(
    () => ({
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
      canvasHandlers: canvasHandlers,
      serviceOrderItems: serviceOrderItems,
      hasValidationErrors: hasValidationErrors,
    }),
    [
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
      canvasHandlers,
      serviceOrderItems,
      hasValidationErrors,
    ]
  );

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
  );
};
