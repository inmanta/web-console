import { ServiceEntityShape } from "../ServiceEntityShape";
import { getConnectedLayerData } from "./layerUtils";

/**
 * What the Arrange action can lay out right now.
 */
export interface ArrangeScope {
  /** Whether there is anything to arrange: at least two visible entities. */
  canArrangeAll: boolean;

  /** Whether the selected entity has visible entities below it to arrange. */
  canArrangeBelow: boolean;

  /**
   * The root the Arrange button lays out: the selected entity when there is something below
   * it, otherwise undefined for the whole canvas.
   */
  rootId?: string;
}

/**
 * Works out what the Arrange button arranges: everything below the selected entity, or the
 * whole canvas when nothing is selected or the selection has nothing below it. Entities hidden
 * in collapsed layers don't count, as the layout leaves them where they are.
 *
 * @param canvasState - The shapes on the canvas
 * @param selected - The selected shape, if any
 * @returns What can be arranged, and the root of the Arrange button
 */
export const getArrangeScope = (
  canvasState: Map<string, ServiceEntityShape>,
  selected: ServiceEntityShape | null
): ArrangeScope => {
  const visibleCount = Array.from(canvasState.values()).filter((shape) => !shape.isHidden).length;
  const canArrangeBelow =
    !!selected &&
    !selected.isHidden &&
    getConnectedLayerData(canvasState, selected).shapes.some((shape) => !shape.isHidden);

  return {
    canArrangeAll: visibleCount >= 2,
    canArrangeBelow,
    rootId: canArrangeBelow ? selected.id : undefined,
  };
};
