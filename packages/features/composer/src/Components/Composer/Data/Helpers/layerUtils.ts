import { ServiceEntityShape } from "../ServiceEntityShape";

/**
 * Returns only the direct (first-layer) children of a shape: the shapes it connects to,
 * other than its own parents.
 */
export const getDirectLayerData = (
  canvasState: Map<string, ServiceEntityShape>,
  shape: ServiceEntityShape
): { shapes: ServiceEntityShape[] } => {
  const directShapeIds = new Set<string>();
  const directShapes: ServiceEntityShape[] = [];

  shape.connections.forEach((targetIds) => {
    targetIds.forEach((targetId) => {
      const otherShape = canvasState.get(targetId);

      // Skip upward traversal (parent → this shape direction).
      // Handles all entity types including "core" inter-service relation targets.
      if (!otherShape || directShapeIds.has(targetId) || shape.parentIds.has(targetId)) {
        return;
      }

      directShapeIds.add(targetId);
      directShapes.push(otherShape);
    });
  });

  return { shapes: directShapes };
};

/**
 * Returns every shape below a shape: its children, their children, and so on.
 *
 * The connections map is bidirectional: a child stores its parent's ID (rootEntities)
 * alongside its own children. We use each shape's parentIds set (populated from
 * rootEntities at construction) to detect upward traversal: if the target ID is a known
 * parent of the current node, the traversal is going up the tree and should be skipped.
 * When parentIds is empty (connections set after construction, e.g. an inventory drop),
 * we fall back to including the target so discovery still works.
 */
export const getConnectedLayerData = (
  canvasState: Map<string, ServiceEntityShape>,
  shape: ServiceEntityShape
): { shapes: ServiceEntityShape[] } => {
  const visitedIds = new Set<string>([shape.id]);
  const layerShapes: ServiceEntityShape[] = [];
  const toVisit: ServiceEntityShape[] = [shape];

  while (toVisit.length > 0) {
    const current = toVisit.pop()!;

    current.connections.forEach((targetIds) => {
      targetIds.forEach((targetId) => {
        const otherShape = canvasState.get(targetId);

        if (!otherShape || visitedIds.has(targetId) || current.parentIds.has(targetId)) {
          return;
        }

        visitedIds.add(targetId);
        layerShapes.push(otherShape);
        toVisit.push(otherShape);
      });
    });
  }

  return { shapes: layerShapes };
};

/**
 * Hides every layer below a shape, and marks each hidden shape as collapsed so it
 * offers to expand when it is shown again.
 */
export const collapseLayers = (
  canvasState: Map<string, ServiceEntityShape>,
  shape: ServiceEntityShape
): void => {
  shape.isLayersCollapsed = true;
  getConnectedLayerData(canvasState, shape).shapes.forEach((child) => {
    child.isHidden = true;
    child.isLayersCollapsed = true;
  });
};

/**
 * Shows the first layer below a collapsed shape; deeper layers stay collapsed.
 */
export const expandLayers = (
  canvasState: Map<string, ServiceEntityShape>,
  shape: ServiceEntityShape
): void => {
  shape.isLayersCollapsed = false;
  getDirectLayerData(canvasState, shape).shapes.forEach((child) => {
    child.isHidden = false;
  });
};

/**
 * Shows every layer below a shape.
 */
export const expandAllLayers = (
  canvasState: Map<string, ServiceEntityShape>,
  shape: ServiceEntityShape
): void => {
  shape.isLayersCollapsed = false;
  getConnectedLayerData(canvasState, shape).shapes.forEach((child) => {
    child.isHidden = false;
    child.isLayersCollapsed = false;
  });
};

/**
 * Reveals the first-layer children of a collapsed shape.
 * Call this before removing a shape so its direct children remain visible on the canvas.
 */
export const revealDirectChildren = (
  canvasState: Map<string, ServiceEntityShape>,
  shape: ServiceEntityShape
): void => {
  if (shape.isLayersCollapsed) {
    expandLayers(canvasState, shape);
  }
};

/**
 * Counts the shapes hidden below a collapsed shape.
 */
export const countHiddenLayers = (
  canvasState: Map<string, ServiceEntityShape>,
  shape: ServiceEntityShape
): number =>
  shape.isLayersCollapsed
    ? getConnectedLayerData(canvasState, shape).shapes.filter((child) => child.isHidden).length
    : 0;
