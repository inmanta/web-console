import { useEffect, useMemo, useState } from "react";
import { ServiceModel } from "@/Core";
import { ServiceEntityShape } from "../../UI";
import { canvasStateToServiceOrderItems } from "../Helpers/deploymentHelpers";
import { ComposerServiceOrderItem } from "../Helpers/deploymentHelpers";

interface UseServiceOrderItemsParams {
  canvasState: Map<string, ServiceEntityShape>;
  initialShapeInfoRef: React.MutableRefObject<Map<string, { service_entity: string }>>;
  serviceCatalog: ServiceModel[] | undefined;
}

interface UseServiceOrderItemsReturn {
  serviceOrderItems: Map<string, ComposerServiceOrderItem>;
  hasValidationErrors: boolean;
}

/**
 * Hook for managing service order items derivation and validation.
 * Converts canvas state to service order items and checks for validation errors.
 */
export const useServiceOrderItems = ({
  canvasState,
  initialShapeInfoRef,
  serviceCatalog,
}: UseServiceOrderItemsParams): UseServiceOrderItemsReturn => {
  const [serviceOrderItems, setServiceOrderItems] = useState<Map<string, ComposerServiceOrderItem>>(
    new Map()
  );

  // Update serviceOrderItems when canvasState changes
  // Note: We read initialShapeInfoRef.current inside the effect to always get the latest value
  useEffect(() => {
    const initialShapeInfo = initialShapeInfoRef.current;
    if (canvasState.size > 0 || initialShapeInfo.size > 0) {
      const orderItems = canvasStateToServiceOrderItems(canvasState, initialShapeInfo);
      setServiceOrderItems(orderItems);
    } else {
      setServiceOrderItems(new Map());
    }
  }, [canvasState, initialShapeInfoRef, serviceCatalog]);

  // Check for validation errors (missing required connections or attributes on any shape)
  const hasValidationErrors = useMemo(() => {
    if (canvasState.size === 0) {
      return false;
    }

    // Check if any shape has missing connections or attribute validation errors
    for (const shape of canvasState.values()) {
      // Ensure attribute validation state is up to date
      shape.validateAttributes();

      if (shape.isMissingConnections() || shape.hasAttributeValidationErrors) {
        return true;
      }
    }

    return false;
  }, [canvasState]);

  return { serviceOrderItems, hasValidationErrors };
};
