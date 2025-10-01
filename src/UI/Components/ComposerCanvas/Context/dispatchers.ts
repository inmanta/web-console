import { dia } from "@inmanta/rappid";
import { ServiceEntityBlock } from "../Shapes";
import { ActionEnum, EventActionEnum } from "../interfaces";

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
