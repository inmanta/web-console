import { useEffect, useMemo, useRef } from "react";
import { dia, shapes, ui } from "@inmanta/rappid";
import { ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Queries/Slices/ServiceInstance/GetInstanceWithRelations";
import { ServiceEntityShape } from "../../UI";
import { ComposerPaper } from "../../UI/JointJsShapes/ComposerPaper";
import { updateAllMissingConnectionsHighlights } from "../../UI/JointJsShapes/createHalo";
import {
  ZOOM_TO_FIT_PADDING_EXISTING_INSTANCE,
  ZOOM_TO_FIT_PADDING_NEW_INSTANCE,
} from "../../config";
import {
  RelationsDictionary,
  initializeCanvasFromInstance,
  createPlaceholderInstance,
  applyCoordinatesFromMetadata,
  applyAutoLayoutToEmbeddedEntities,
} from "../Helpers";

/**
 * Parameters for the `useComposerGraph` hook.
 */
interface UseComposerGraphParams {
  editable: boolean;
  serviceName: string;
  instanceId?: string;
  serviceCatalog: ServiceModel[] | undefined;
  mainService: ServiceModel | undefined;
  relationsDictionary: RelationsDictionary;
  instanceData: InstanceWithRelations | undefined | null;
  isInstanceDataReady: boolean;
  onCanvasStateInitialized: (entities: Map<string, ServiceEntityShape>) => void;
  onInitialShapeInfoTracked: (shapeInfo: Map<string, { service_entity: string }>) => void;
}

/**
 * Return value of the `useComposerGraph` hook.
 */
interface UseComposerGraphReturn {
  graph: dia.Graph;
  paper: dia.Paper;
  scroller: ui.PaperScroller;
}

/**
 * Hook for managing the JointJS graph, paper, and scroller setup and initialization.
 * Handles creating the graph/paper/scroller instances and initializing the canvas
 * from instance data or creating a placeholder for new instances.
 */
export const useComposerGraph = ({
  editable,
  serviceCatalog,
  mainService,
  relationsDictionary,
  instanceData,
  isInstanceDataReady,
  instanceId,
  serviceName,
  onCanvasStateInitialized,
  onInitialShapeInfoTracked,
}: UseComposerGraphParams): UseComposerGraphReturn => {
  const initializationKeyRef = useRef<string | null>(null);

  // Create graph, paper, and scroller only once using useMemo to prevent recreation on every render
  const graph = useMemo(() => new dia.Graph({}, { cellNamespace: shapes }), []);
  const paper = useMemo(
    () => new ComposerPaper(graph, editable, relationsDictionary, serviceCatalog || []).paper,
    [graph, editable, relationsDictionary, serviceCatalog]
  );
  const scroller = useMemo(
    () =>
      new ui.PaperScroller({
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
      }),
    [paper]
  );

  // Initialize canvas from instance data or create placeholder for new instance
  useEffect(() => {
    if (!serviceCatalog || !mainService || !graph || !paper || !scroller) {
      return;
    }

    const initializationKey = `${serviceName ?? ""}:${instanceId ?? "new"}`;
    if (initializationKeyRef.current === initializationKey && graph.getCells().length > 0) {
      // Already initialized for this instance; avoid clearing user changes
      return;
    }

    let dataToUse: InstanceWithRelations | undefined;

    if (instanceId) {
      // Case 1: Editing existing instance - wait for data to be fetched
      if (!isInstanceDataReady || !instanceData) {
        return;
      }
      dataToUse = instanceData;
    } else {
      // Case 2: Creating new instance - use placeholder
      dataToUse = createPlaceholderInstance(mainService);
    }

    // Clear the graph to remove any old cells before initializing
    graph.getCells().forEach((cell) => cell.remove());

    // Add all entities to the graph
    const initializedEntities = initializeCanvasFromInstance(
      dataToUse,
      serviceCatalog,
      relationsDictionary,
      graph
    );
    onCanvasStateInitialized(initializedEntities);
    initializationKeyRef.current = initializationKey;

    // Track initial shape info for delete detection (only for existing instances, not new ones)
    if (instanceId) {
      const initialShapeInfo = new Map<string, { service_entity: string }>();
      initializedEntities.forEach((shape, id) => {
        initialShapeInfo.set(id, { service_entity: shape.getEntityName() });
      });
      onInitialShapeInfoTracked(initialShapeInfo);
    } else {
      onInitialShapeInfoTracked(new Map());
    }

    // Apply coordinates from metadata if available, otherwise use default layout
    const metadataCoordinates = dataToUse.instance.metadata?.coordinates;
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
    // Use a larger padding for new instances so a single item doesn't appear too large
    requestAnimationFrame(() => {
      const padding = instanceId
        ? ZOOM_TO_FIT_PADDING_EXISTING_INSTANCE
        : ZOOM_TO_FIT_PADDING_NEW_INSTANCE;
      scroller.zoomToFit({ useModelGeometry: true, padding });
    });

    // Update missing connections highlights after canvas is initialized
    // Use setTimeout to ensure paper is fully rendered
    setTimeout(() => {
      updateAllMissingConnectionsHighlights(paper);
    }, 100);
  }, [
    instanceId,
    isInstanceDataReady,
    instanceData,
    serviceCatalog,
    mainService,
    relationsDictionary,
    graph,
    paper,
    scroller,
    serviceName,
    onCanvasStateInitialized,
    onInitialShapeInfoTracked,
  ]);

  return { graph, paper, scroller };
};
