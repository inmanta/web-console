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

/**
 * Grid layout constants
 */
const GRID_COLUMN_WIDTH = 420;
const GRID_ROW_HEIGHT = 200;
const GRID_START_X = 100;
const GRID_START_Y = 100;

/**
 * Applies a grid-based layout to the graph
 * Organizes shapes in columns based on their hierarchy depth
 * 
 * @param graph - The JointJS graph
 */
export const applyGridLayout = (graph: dia.Graph): void => {
    const elements = graph.getElements();

    if (elements.length === 0) {
        return;
    }

    // Calculate hierarchy depth for each element
    const depthMap = new Map<string, number>();
    const processed = new Set<string>();

    /**
     * Calculate the depth of an element based on its connections
     */
    const calculateDepth = (elementId: string, visited: Set<string> = new Set()): number => {
        if (visited.has(elementId)) {
            return 0; // Prevent cycles
        }
        visited.add(elementId);

        if (depthMap.has(elementId)) {
            return depthMap.get(elementId)!;
        }

        const element = graph.getCell(elementId) as dia.Element;
        if (!element) {
            return 0;
        }

        // Find incoming links (links that target this element)
        const incomingLinks = graph.getLinks().filter((link) => {
            const targetElement = link.getTargetElement();
            return targetElement ? String(targetElement.id) === elementId : false;
        });

        if (incomingLinks.length === 0) {
            // Root element (no incoming links)
            depthMap.set(elementId, 0);
            return 0;
        }

        // Find the maximum depth of source elements
        let maxSourceDepth = -1;
        incomingLinks.forEach((link) => {
            const sourceElement = link.getSourceElement();
            if (sourceElement) {
                const sourceDepth = calculateDepth(String(sourceElement.id), new Set(visited));
                maxSourceDepth = Math.max(maxSourceDepth, sourceDepth);
            }
        });

        const depth = maxSourceDepth + 1;
        depthMap.set(elementId, depth);
        return depth;
    };

    // Calculate depth for all elements
    elements.forEach((element) => {
        const elementId = String(element.id);
        if (!processed.has(elementId)) {
            calculateDepth(elementId);
            processed.add(elementId);
        }
    });

    // Group elements by depth
    const elementsByDepth = new Map<number, dia.Element[]>();
    let maxDepth = 0;

    elements.forEach((element) => {
        const elementId = String(element.id);
        const depth = depthMap.get(elementId) ?? 0;
        maxDepth = Math.max(maxDepth, depth);

        if (!elementsByDepth.has(depth)) {
            elementsByDepth.set(depth, []);
        }
        elementsByDepth.get(depth)!.push(element);
    });

    // Position elements in grid
    elementsByDepth.forEach((elementsAtDepth, depth) => {
        const columnX = GRID_START_X + depth * GRID_COLUMN_WIDTH;

        elementsAtDepth.forEach((element, index) => {
            try {
                const bbox = element.getBBox();
                const rowY = GRID_START_Y + index * GRID_ROW_HEIGHT;

                element.set("position", {
                    x: columnX,
                    y: rowY,
                });
            } catch (error) {
                // Fallback if bbox is not available
                element.set("position", {
                    x: columnX,
                    y: GRID_START_Y + index * GRID_ROW_HEIGHT,
                });
            }
        });
    });
};

