import { ServiceEntityShape } from "../ServiceEntityShape";

/**
 * A line on the canvas between two connected shapes, drawn from parent to child.
 */
export interface ShapeConnection {
  id: string;
  source: string;
  target: string;
}

/**
 * Lists the connections on the canvas from the shapes' connections maps: one per connected
 * pair of shapes that are both on the canvas. The maps are the source of truth; this list only
 * exists to be drawn.
 *
 * A connection points from the parent to the child when one is a known parent of the other,
 * and otherwise from the shape that was put on the canvas first.
 *
 * @param canvasState - The shapes on the canvas, keyed by id
 * @returns The connections between them
 */
export const getCanvasConnections = (
  canvasState: Map<string, ServiceEntityShape>
): ShapeConnection[] => {
  const connections: ShapeConnection[] = [];
  const connectedPairs = new Set<string>();

  canvasState.forEach((shape, shapeId) => {
    shape.connections.forEach((targetIds) => {
      targetIds.forEach((targetId) => {
        const targetShape = canvasState.get(targetId);

        if (!targetShape || targetId === shapeId) {
          return;
        }

        const pair = [shapeId, targetId].sort().join("|");

        if (connectedPairs.has(pair)) {
          return;
        }
        connectedPairs.add(pair);

        const isChildOfTarget =
          shape.parentIds.has(targetId) && !targetShape.parentIds.has(shapeId);
        const [source, target] = isChildOfTarget ? [targetId, shapeId] : [shapeId, targetId];

        connections.push({ id: `${source}->${target}`, source, target });
      });
    });
  });

  return connections;
};

/**
 * Updates connections between two shapes (adds connections to both).
 * This consolidates the connection update logic used in multiple places.
 *
 * @param sourceShape - The source shape
 * @param targetShape - The target shape
 */
export const addConnectionsBetweenShapes = (
  sourceShape: ServiceEntityShape,
  targetShape: ServiceEntityShape
): void => {
  const sourceRelationKey = targetShape.getEntityType();
  const targetRelationKey = sourceShape.getEntityType();

  sourceShape.addConnection(String(targetShape.id), sourceRelationKey);
  targetShape.addConnection(String(sourceShape.id), targetRelationKey);
  // sourceShape is the link source (parent); record it as a known parent of targetShape
  targetShape.parentIds.add(String(sourceShape.id));
};

/**
 * Removes connections between two shapes (removes from both).
 * This consolidates the connection removal logic used in multiple places.
 *
 * @param sourceShape - The source shape
 * @param targetShape - The target shape
 */
export const removeConnectionsBetweenShapes = (
  sourceShape: ServiceEntityShape,
  targetShape: ServiceEntityShape
): void => {
  const sourceRelationKey = targetShape.getEntityType();
  const targetRelationKey = sourceShape.getEntityType();

  sourceShape.removeConnection(String(targetShape.id), sourceRelationKey);
  targetShape.removeConnection(String(sourceShape.id), targetRelationKey);
  targetShape.parentIds.delete(String(sourceShape.id));
};
