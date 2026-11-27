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
  serviceCatalog: ServiceModel[];
  mainService: ServiceModel;
  relationsDictionary: RelationsDictionary;

  /** The instance being edited or viewed, with its related instances; none for a new instance. */
  instance?: InstanceWithRelations;
  onCanvasStateInitialized: (entities: Map<string, ServiceEntityShape>) => void;
}

/**
 * Fills the canvas: from the instance being edited or viewed, or with a placeholder for a new
 * instance. It runs once per instance, so a refetch of the catalog doesn't throw away the user's
 * changes.
 */
export const useComposerInitialization = ({
  serviceCatalog,
  mainService,
  relationsDictionary,
  instance,
  onCanvasStateInitialized,
}: UseComposerInitializationParams): void => {
  const initializationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const initializationKey = `${mainService.name}:${instance?.instance.id ?? "new"}`;
    if (initializationKeyRef.current === initializationKey) {
      // Already initialized for this instance; avoid clearing user changes
      return;
    }

    // The instance to edit or view, or a placeholder for a new one
    const dataToUse = instance ?? createPlaceholderInstance(mainService, serviceCatalog);

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
  }, [instance, serviceCatalog, mainService, relationsDictionary, onCanvasStateInitialized]);
};
