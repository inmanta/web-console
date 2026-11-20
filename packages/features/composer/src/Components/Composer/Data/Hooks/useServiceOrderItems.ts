import { useMemo } from "react";
import { ServiceOrderItemRequest } from "@inmanta/web-console-core";
import { canvasStateToServiceOrderItems } from "../Helpers/deploymentHelpers";
import { ServiceEntityShape } from "../ServiceEntityShape";

interface UseServiceOrderItemsParams {
  canvasState: Map<string, ServiceEntityShape>;
}

interface UseServiceOrderItemsReturn {
  serviceOrderItems: Map<string, ServiceOrderItemRequest>;
  hasValidationErrors: boolean;
}

/**
 * Hook for managing service order items derivation and validation.
 * Converts canvas state to service order items and checks for validation errors.
 */
export const useServiceOrderItems = ({
  canvasState,
}: UseServiceOrderItemsParams): UseServiceOrderItemsReturn => {
  // Each new canvas map recomputes the order items (see CanvasActions in Context.tsx)
  const serviceOrderItems = useMemo(
    () => canvasStateToServiceOrderItems(canvasState),
    [canvasState]
  );

  // Check for validation errors (missing required connections or attributes on any shape)
  const hasValidationErrors = useMemo(() => {
    if (canvasState.size === 0) {
      return false;
    }

    // Check if any shape has missing connections or attribute validation errors
    for (const shape of canvasState.values()) {
      // A shape staged to be deleted only orders its delete, so its problems don't block
      if (shape.isMarkedForDeletion) {
        continue;
      }

      // Ensure attribute validation state is up to date
      shape.validateAttributes();

      if (shape.isMissingConnections(canvasState) || shape.hasAttributeValidationErrors) {
        return true;
      }
    }

    return false;
  }, [canvasState]);

  return { serviceOrderItems, hasValidationErrors };
};
