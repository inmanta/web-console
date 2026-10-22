import { dia } from "@joint/plus";
import { v4 as uuidv4 } from "uuid";
import { ServiceOrderItemAction, ServiceOrderItemRequest } from "@/Core";
import { ServiceEntityShape } from "../../UI";
import { SavedCoordinates } from "./canvasLayoutUtils";

/**
 * Gets the coordinates of all ServiceEntityShape cells in the graph.
 *
 * @param {dia.Graph} graph - The graph from which to get the cells.
 * @returns {SavedCoordinates[]} An array of objects, each containing the id and coordinates of a cell.
 */
export const getCellsCoordinates = (graph: dia.Graph): SavedCoordinates[] => {
  const cells = graph.getCells();

  return cells
    .filter((cell) => {
      // Check if it's a ServiceEntityShape
      return cell.get("type") === "app.ServiceEntityShape";
    })
    .map((cell) => {
      const position = cell.position();

      return {
        id: String(cell.id),
        coordinates: {
          x: position.x,
          y: position.y,
        },
      };
    });
};

/**
 * Converts canvasState (Map of ServiceEntityShape) to serviceOrderItems (Map of ServiceOrderItemRequest)
 * Each shape builds its own order item representation, including nested embedded entities and inter_service_relations.
 * Also handles delete actions for shapes that existed initially but are now missing.
 *
 * @param {Map<string, ServiceEntityShape>} canvasState - The current canvas state
 * @param {Map<string, { service_entity: string }>} initialShapeInfo - Map of initial shape IDs to their service_entity (for delete detection)
 * @returns {Map<string, ServiceOrderItemRequest>} The converted service order items
 */
export const canvasStateToServiceOrderItems = (
  canvasState: Map<string, ServiceEntityShape>,
  initialShapeInfo: Map<string, { service_entity: string }> = new Map()
): Map<string, ServiceOrderItemRequest> => {
  const serviceOrderItems = new Map<string, ServiceOrderItemRequest>();

  // Update all orderItems first (in case they're stale)
  canvasState.forEach((shape) => {
    shape.updateOrderItem(canvasState);
  });

  // Collect orderItems from current shapes
  canvasState.forEach((shape) => {
    if (shape.orderItem) {
      serviceOrderItems.set(String(shape.id), shape.orderItem);
    }
  });

  // Add delete items for shapes that existed initially but are now missing
  initialShapeInfo.forEach((info, shapeId) => {
    if (!canvasState.has(shapeId)) {
      // Shape was deleted - create a delete order item
      const deleteAction: ServiceOrderItemAction = "delete";
      serviceOrderItems.set(shapeId, {
        instance_id: shapeId,
        service_entity: info.service_entity,
        config: {},
        action: deleteAction,
        attributes: null,
        edits: null,
      });
    }
  });

  return serviceOrderItems;
};

/**
 * Transforms a service order item for update actions by converting attributes to edits format.
 * This matches the old ComposerCanvas behavior where update actions use edits instead of attributes.
 *
 * @param {ServiceOrderItemRequest} item - The service order item to transform
 * @returns {ServiceOrderItemRequest} The transformed service order item
 */
const transformUpdateItem = (item: ServiceOrderItemRequest): ServiceOrderItemRequest => {
  // For update actions, convert attributes to edits format
  // Note: Embedded entities are nested in parent attributes, so they don't appear as separate items
  if (item.action === "update" && item.attributes && !item.edits) {
    const { attributes, ...rest } = item;

    return {
      ...rest,
      edits: [
        {
          edit_id: `${item.instance_id}_order_update-${uuidv4()}`,
          operation: "replace",
          target: ".",
          value: attributes,
        },
      ] as [Record<string, unknown>],
    };
  }

  return item;
};

/**
 * Converts a Map of ServiceOrderItemRequest to an array, filtering out items with null actions.
 * Also transforms update items to use edits format instead of attributes.
 *
 * @param {Map<string, ServiceOrderItemRequest>} serviceOrderItems - The map of service order items
 * @returns {ServiceOrderItemRequest[]} Array of service order items with non-null actions, transformed for API
 */
export const getServiceOrderItemsArray = (
  serviceOrderItems: Map<string, ServiceOrderItemRequest>
): ServiceOrderItemRequest[] => {
  return Array.from(serviceOrderItems.values())
    .filter((item) => item.action !== null)
    .map(transformUpdateItem);
};
