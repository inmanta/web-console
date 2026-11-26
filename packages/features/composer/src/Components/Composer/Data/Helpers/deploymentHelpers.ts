import { v4 as uuidv4 } from "uuid";
import { ServiceOrderItemRequest } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { SavedCoordinates } from "./canvasLayoutUtils";

/**
 * Gets the coordinates of all shapes on the canvas.
 *
 * @param {Map<string, ServiceEntityShape>} canvasState - The shapes on the canvas.
 * @returns {SavedCoordinates[]} An array of objects, each containing the id and coordinates of a shape.
 */
export const getShapesCoordinates = (
  canvasState: Map<string, ServiceEntityShape>
): SavedCoordinates[] =>
  Array.from(canvasState.values()).map((shape) => {
    const position = shape.getPosition();

    return {
      id: String(shape.id),
      coordinates: {
        x: position.x,
        y: position.y,
      },
    };
  });

/**
 * Converts canvasState (Map of ServiceEntityShape) to serviceOrderItems (Map of ServiceOrderItemRequest)
 * Each shape builds its own order item representation, including nested embedded entities and inter_service_relations.
 * An instance staged to be deleted orders its delete; embedded entities have no item of their own.
 *
 * @param {Map<string, ServiceEntityShape>} canvasState - The current canvas state
 * @returns {Map<string, ServiceOrderItemRequest>} The converted service order items
 */
export const canvasStateToServiceOrderItems = (
  canvasState: Map<string, ServiceEntityShape>
): Map<string, ServiceOrderItemRequest> => {
  const serviceOrderItems = new Map<string, ServiceOrderItemRequest>();

  canvasState.forEach((shape) => {
    const orderItem = shape.getOrderItem(canvasState);

    if (orderItem) {
      serviceOrderItems.set(String(shape.id), orderItem);
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
