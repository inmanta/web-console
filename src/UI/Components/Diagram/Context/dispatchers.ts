import { dia } from "@inmanta/rappid";
import { ActionEnum, EventActionEnum, InterServiceRelationOnCanvasWithMin } from "../interfaces";
import { ServiceEntityBlock } from "../Shapes";

/**
 * Dispatches an event to update inter-service relations.
 *
 * @param {EventActionEnum} action - The action to perform.
 * @param {string} name - The name of the inter-service relation.
 * @param {string | dia.Cell.ID} id - The ID of the inter-service relation.
 *
 * @returns {void}
 */
export const dispatchUpdateInterServiceRelations = (
  action: EventActionEnum,
  name: string,
  id: string | dia.Cell.ID
): void => {
  document.dispatchEvent(
    new CustomEvent("updateInterServiceRelations", {
      detail: {
        action,
        name,
        id,
      },
    })
  );
};

/**
 * Dispatches an event to update service order items.
 *
 * @param {ServiceEntityBlock | dia.Cell} cell - The cell to update.
 * @param {ActionEnum} action - The action to perform.
 *
 * @returns {void}
 */
export const dispatchUpdateServiceOrderItems = (
  cell: ServiceEntityBlock | dia.Cell,
  action: ActionEnum
): void => {
  document.dispatchEvent(
    new CustomEvent("updateServiceOrderItems", {
      detail: { cell, action },
    })
  );
};

/**
 * Dispatches an event to add an inter-service relation to the tracker.
 *
 * @param {string | dia.Cell.ID} id - The ID of the inter-service relation.
 * @param {string} name - The name of the inter-service relation.
 * @param {InterServiceRelationOnCanvasWithMin[]} relations - The relations to add.
 *
 * @returns {void}
 */
export const dispatchAddInterServiceRelationToTracker = (
  id: string | dia.Cell.ID,
  name: string,
  relations: InterServiceRelationOnCanvasWithMin[]
): void => {
  document.dispatchEvent(
    new CustomEvent("addInterServiceRelationToTracker", {
      detail: {
        id,
        name,
        relations,
      },
    })
  );
};

/**
 * Dispatches an event to remove an inter-service relation from the tracker.
 *
 * @param {string | dia.Cell.ID} id - The ID of the inter-service relation.
 *
 * @returns {void}
 */
export const dispatchRemoveInterServiceRelationFromTracker = (id: string | dia.Cell.ID): void => {
  document.dispatchEvent(
    new CustomEvent("removeInterServiceRelationFromTracker", {
      detail: {
        id,
      },
    })
  );
};

/**
 * Dispatches an event to update the stencil.
 *
 * @param {string} name - The name of the stencil.
 * @param {EventActionEnum} [action] - The action to perform, could be undefined when we are refreshing view after continuous query, then state of the canvas doesn't change but all cells are being reapplied.
 *
 * @returns {void}
 */
export const dispatchUpdateStencil = (name: string, action?: EventActionEnum): void => {
  document.dispatchEvent(
    new CustomEvent("updateStencil", {
      detail: {
        name,
        action,
      },
    })
  );
};

/**
 * Dispatches an event to handle a loose element.
 *
 * @param {EventActionEnum} kind - The kind of event to dispatch.
 * @param {string | dia.Cell.ID} id - The ID of the loose element.
 *
 * @returns {void}
 */
export const dispatchLooseElement = (kind: EventActionEnum, id: string | dia.Cell.ID): void => {
  document.dispatchEvent(
    new CustomEvent("looseElement", {
      detail: JSON.stringify({
        kind,
        id,
      }),
    })
  );
};

/**
 * Dispatches an event to send a selected cell to the sidebar.
 *
 * @param {dia.CellView | null} cell - The cell to send to the sidebar, null is when we click on the canvas to clear the sidebar.
 *
 * @returns {void}
 */
export const dispatchSendCellToSidebar = (cell: dia.CellView | null) => {
  document.dispatchEvent(
    new CustomEvent("sendCellToSidebar", {
      detail: cell,
    })
  );
};
