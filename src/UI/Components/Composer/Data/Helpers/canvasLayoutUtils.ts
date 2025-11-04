import { dia } from "@inmanta/rappid";
import { DirectedGraph } from "@joint/layout-directed-graph";

/**
 * Interface for saved coordinates from metadata
 */
export interface SavedCoordinates {
    id: string;
    coordinates: { x: number; y: number };
}

/**
 * Applies saved coordinates from metadata to cells in the graph
 * 
 * @param graph - The JointJS graph
 * @param coordinates - Array of saved coordinates from metadata
 */
export const applyCoordinatesFromMetadata = (
    graph: dia.Graph,
    coordinates: SavedCoordinates[]
): void => {
    const cells = graph.getCells();

    coordinates.forEach((savedCoord) => {
        const cell = cells.find((c) => c.id === savedCoord.id);
        if (cell) {
            cell.set("position", {
                x: savedCoord.coordinates.x,
                y: savedCoord.coordinates.y,
            });
        }
    });
};

/**
 * Checks for overlapping cells and moves them to prevent collisions
 * Moves colliding cells down by 50px until no collision is found
 * 
 * @param graph - The JointJS graph
 * @param cells - Array of cells to check for collisions
 */
export const fixCollidingCells = (graph: dia.Graph, cells: dia.Cell[]): void => {
    cells.forEach((cell) => {
        let isColliding = false;

        do {
            // Find all cells that overlap with the current cell's bounding box
            const overlappingCells = graph
                .findModelsInArea(cell.getBBox())
                .filter((el) => el.id !== cell.id);

            if (overlappingCells.length > 0) {
                isColliding = true;
                // Move the cell down by 50px
                const pos = cell.position();
                cell.set("position", {
                    x: pos.x,
                    y: pos.y + 50,
                });
            } else {
                isColliding = false;
            }
        } while (isColliding);
    });
};

/**
 * Applies auto-layout to the graph using DirectedGraph
 * 
 * @param graph - The JointJS graph
 */
export const applyAutoLayout = (graph: dia.Graph): void => {
    if (graph.getCells().length > 0 && DirectedGraph) {
        try {
            DirectedGraph.layout(graph, {
                nodeSep: 80,
                edgeSep: 80,
                rankDir: "BT",
            });
        } catch (error) {
            // do nothing, this can happen with rerendering the canvas since we are mixing react and jointJs.
        }
    }
};

