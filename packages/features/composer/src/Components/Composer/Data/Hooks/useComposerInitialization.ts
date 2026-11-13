import { useEffect, useRef } from "react";
import { ServiceModel } from "@inmanta/web-console-core";
import { InstanceWithRelations } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance/GetInstanceWithRelations";
import {
  RelationsDictionary,
  initializeCanvasFromInstance,
  createPlaceholderInstance,
  applyCoordinatesFromMetadata,
  applyAutoLayoutToEmbeddedEntities,
} from "../Helpers";
import { ServiceEntityShape } from "../ServiceEntityShape";

/**
 * Parameters for the `useComposerInitialization` hook.
 */
interface UseComposerInitializationParams {
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
 * Hook that fills the canvas once the data is there: from the instance being edited,
 * or with a placeholder for a new instance.
 * It runs once per instance, so a refetch of the catalog doesn't throw away the user's changes.
 */
export const useComposerInitialization = ({
  serviceCatalog,
  mainService,
  relationsDictionary,
  instanceData,
  isInstanceDataReady,
  instanceId,
  serviceName,
  onCanvasStateInitialized,
  onInitialShapeInfoTracked,
}: UseComposerInitializationParams): void => {
  const initializationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!serviceCatalog || !mainService) {
      return;
    }

    const initializationKey = `${serviceName ?? ""}:${instanceId ?? "new"}`;
    if (initializationKeyRef.current === initializationKey) {
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
      dataToUse = createPlaceholderInstance(mainService, serviceCatalog);
    }

    const initializedEntities = initializeCanvasFromInstance(
      dataToUse,
      serviceCatalog,
      relationsDictionary
    );

    // Apply coordinates from metadata if available, otherwise keep the default layout
    const metadataCoordinates = dataToUse.instance.metadata?.coordinates;
    if (metadataCoordinates) {
      try {
        const parsedMetadata = JSON.parse(metadataCoordinates);
        if (parsedMetadata.version === "v2" && parsedMetadata.data) {
          // Apply saved coordinates from metadata (overrides manual positioning)
          // This only applies to core and relation entities, not embedded entities
          applyCoordinatesFromMetadata(initializedEntities, parsedMetadata.data);
          // Embedded entities can't be targeted by ids since they don't have any persistent ids,
          // so they go next to their parents.
          applyAutoLayoutToEmbeddedEntities(initializedEntities);
        }
      } catch (error) {
        console.warn("Failed to parse coordinates from metadata:", error);
      }
    }

    onCanvasStateInitialized(initializedEntities);
    initializationKeyRef.current = initializationKey;

    // Track initial shape info for delete detection (only for existing instances, not new ones).
    // Embedded entities deploy within their instance's attributes, never as delete order items
    // of their own, so they are not tracked.
    if (instanceId) {
      const initialShapeInfo = new Map<string, { service_entity: string }>();
      initializedEntities.forEach((shape, id) => {
        if (shape.entityType !== "embedded") {
          initialShapeInfo.set(id, { service_entity: shape.getEntityType() });
        }
      });
      onInitialShapeInfoTracked(initialShapeInfo);
    } else {
      onInitialShapeInfoTracked(new Map());
    }
  }, [
    instanceId,
    isInstanceDataReady,
    instanceData,
    serviceCatalog,
    mainService,
    relationsDictionary,
    serviceName,
    onCanvasStateInitialized,
    onInitialShapeInfoTracked,
  ]);
};
