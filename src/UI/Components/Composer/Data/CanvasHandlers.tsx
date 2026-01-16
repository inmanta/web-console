import { dia } from "@inmanta/rappid";
import { SavedCoordinates } from "./Helpers/canvasLayoutUtils";
import { getCellsCoordinates } from "./Helpers/deploymentHelpers";

export interface CanvasHandlers {
    /**
     * Gets the coordinates of all cells in the graph.
     * 
     * @returns {SavedCoordinates[]} The array of coordinates for all elements in the canvas.
     */
    getCoordinates: () => SavedCoordinates[];
}

/**
 * Creates a CanvasHandlers instance with the getCoordinates method
 * 
 * @param {dia.Graph} graph - The JointJS graph
 * @returns {CanvasHandlers} The canvas handlers instance
 */
export const createCanvasHandlers = (graph: dia.Graph): CanvasHandlers => {
    return {
        getCoordinates: () => getCellsCoordinates(graph),
    };
};