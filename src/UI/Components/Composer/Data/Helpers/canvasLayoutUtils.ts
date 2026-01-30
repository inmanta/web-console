import { dia } from "@inmanta/rappid";
import { DirectedGraph } from "@joint/layout-directed-graph";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { SHAPE_WIDTH, SHAPE_MIN_HEIGHT } from "../../config";
import {
  HORIZONTAL_SPACING,
  VERTICAL_SPACING,
  GRID_COLUMN_WIDTH,
  GRID_ROW_HEIGHT,
  GRID_START_X,
  GRID_START_Y,
} from "../../config/layoutConfig";
import { PositionTracker } from "./positionTracker";
import { getShapeDimensions } from "./shapeUtils";

/**
 * Interface for saved coordinates from metadata
 */
export interface SavedCoordinates {
  id: string;
  coordinates: { x: number; y: number };
}

/**
 * Applies saved coordinates from metadata to cells in the graph
 * Skips embedded entities (they will be positioned via autolayout. They don't have persistent ids.)
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
    const cell = cells.find((c) => String(c.id) === String(savedCoord.id));
    if (cell && cell instanceof ServiceEntityShape) {
      if (cell.entityType === "embedded") {
        return;
      }
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
    } catch {
      // do nothing, this can happen with rerendering the canvas since we are mixing react and jointJs.
    }
  }
};

/**
 * Positions embedded entities to the right of their parent entities
 * Uses the same positioning logic as createEmbeddedEntityShapes
 *
 * @param graph - The JointJS graph
 */
export const applyAutoLayoutToEmbeddedEntities = (graph: dia.Graph): void => {
  const elements = graph.getElements();
  const embeddedEntities: ServiceEntityShape[] = [];
  const parentMap = new Map<string, ServiceEntityShape>(); // parentId -> parent shape
  const embeddedByParent = new Map<string, ServiceEntityShape[]>(); // parentId -> embedded entities

  // Find all embedded entities and their parents
  elements.forEach((element) => {
    if (element instanceof ServiceEntityShape) {
      if (element.entityType === "embedded") {
        embeddedEntities.push(element);
      } else {
        // Store non-embedded entities as potential parents
        parentMap.set(String(element.id), element);
      }
    }
  });

  // If there are no embedded entities, nothing to do
  if (embeddedEntities.length === 0) {
    return;
  }

  // Create a position tracker and populate it with all existing element positions
  const positionTracker = new PositionTracker(VERTICAL_SPACING, SHAPE_WIDTH, SHAPE_MIN_HEIGHT);
  elements.forEach((element) => {
    if (element instanceof ServiceEntityShape && element.entityType !== "embedded") {
      const pos = element.position();
      const { width: bboxWidth, height: bboxHeight } = getShapeDimensions(element);
      positionTracker.reserve(String(element.id), pos.x, pos.y, bboxWidth, bboxHeight);
    }
  });

  // Find parent for each embedded entity by looking at incoming links
  embeddedEntities.forEach((embeddedEntity) => {
    const links = graph.getLinks();
    let parentId: string | null = null;

    // Find links where this embedded entity is the target
    for (const link of links) {
      const sourceElement = link.getSourceElement();
      const targetElement = link.getTargetElement();

      if (targetElement && String(targetElement.id) === String(embeddedEntity.id)) {
        if (sourceElement && sourceElement instanceof ServiceEntityShape) {
          // Found a parent - embedded entities should only have one parent
          parentId = String(sourceElement.id);
          break;
        }
      }
    }

    if (parentId && parentMap.has(parentId)) {
      if (!embeddedByParent.has(parentId)) {
        embeddedByParent.set(parentId, []);
      }
      embeddedByParent.get(parentId)!.push(embeddedEntity);
    }
  });

  // Position embedded entities relative to their parents using the same logic as createEmbeddedEntityShapes
  embeddedByParent.forEach((embeddedList, parentId) => {
    const parent = parentMap.get(parentId);
    if (!parent) return;

    const parentPos = parent.position();
    const offsetX = parentPos.x + HORIZONTAL_SPACING;

    // Sort embedded entities by their current Y position to maintain relative order
    embeddedList.sort((a, b) => {
      const aPos = a.position();
      const bPos = b.position();
      return aPos.y - bPos.y;
    });

    // Position each embedded entity, stacking them vertically
    embeddedList.forEach((embeddedEntity, index) => {
      const startY = parentPos.y + index * VERTICAL_SPACING;
      const finalY = positionTracker.findNextYPosition(
        offsetX,
        SHAPE_WIDTH,
        SHAPE_MIN_HEIGHT,
        startY
      );

      embeddedEntity.set("position", {
        x: offsetX,
        y: finalY,
      });

      // Get the actual bounding box to reserve the correct space
      const { width: bboxWidth, height: bboxHeight } = getShapeDimensions(embeddedEntity);
      positionTracker.reserve(String(embeddedEntity.id), offsetX, finalY, bboxWidth, bboxHeight);
    });
  });
};

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
        const rowY = GRID_START_Y + index * GRID_ROW_HEIGHT;

        element.set("position", {
          x: columnX,
          y: rowY,
        });
      } catch {
        // Fallback if bbox is not available
        element.set("position", {
          x: columnX,
          y: GRID_START_Y + index * GRID_ROW_HEIGHT,
        });
      }
    });
  });
};
