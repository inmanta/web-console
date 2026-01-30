import { dia } from "@inmanta/rappid";
import { ServiceEntityShape } from "../UI/JointJsShapes/ServiceEntityShape";
import { isServiceEntityShapeCell } from "./Helpers";
import { SavedCoordinates } from "./Helpers/canvasLayoutUtils";
import { getCellsCoordinates } from "./Helpers/deploymentHelpers";

export interface CanvasHandlers {
  /**
   * Gets the coordinates of all cells in the graph.
   *
   * @returns {SavedCoordinates[]} The array of coordinates for all elements in the canvas.
   */
  getCoordinates: () => SavedCoordinates[];

  /**
   * Gets and validates both source and target shapes from a link.
   * Returns null if either side is missing or not a ServiceEntityShape.
   */
  getShapesFromLink: (
    link: dia.Link
  ) => { sourceShape: ServiceEntityShape; targetShape: ServiceEntityShape } | null;

  /**
   * Returns the source shape for a link if it exists and is a ServiceEntityShape.
   * If invalid, removes the link view and returns null.
   */
  getValidSourceShape: (linkView: dia.LinkView) => ServiceEntityShape | null;
}

/**
 * Creates a CanvasHandlers instance with helpers that operate purely on the graph.
 *
 * @param {dia.Graph} graph - The JointJS graph
 * @returns {CanvasHandlers} The canvas handlers instance
 */
export const createCanvasHandlers = (graph: dia.Graph): CanvasHandlers => {
  const getShapesFromLink: CanvasHandlers["getShapesFromLink"] = (link) => {
    const source = link.source();
    const target = link.target();

    if (!source.id || !target.id) {
      return null;
    }

    const sourceCell = graph.getCell(source.id);
    const targetCell = graph.getCell(target.id);

    if (
      !sourceCell ||
      !targetCell ||
      !isServiceEntityShapeCell(sourceCell) ||
      !isServiceEntityShapeCell(targetCell)
    ) {
      return null;
    }

    return { sourceShape: sourceCell, targetShape: targetCell };
  };

  const getValidSourceShape: CanvasHandlers["getValidSourceShape"] = (linkView) => {
    const source = linkView.model.source();
    if (!source.id) {
      linkView.remove();
      return null;
    }

    const sourceCell = graph.getCell(source.id);
    if (!sourceCell || !isServiceEntityShapeCell(sourceCell)) {
      linkView.remove();
      return null;
    }

    return sourceCell;
  };

  return {
    getCoordinates: () => getCellsCoordinates(graph),
    getShapesFromLink,
    getValidSourceShape,
  };
};
