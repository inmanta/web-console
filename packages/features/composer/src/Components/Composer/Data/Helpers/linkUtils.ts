import { ServiceEntityShape } from "../ServiceEntityShape";

/**
 * A line on the canvas between two connected shapes, drawn from parent to child.
 */
export interface ComposerLink {
  id: string;
  source: string;
  target: string;
}

/**
 * Derives the links from the shapes' connections maps: one link per connected pair of
 * shapes that are both on the canvas. The connections are the source of truth; the
 * links only exist to be drawn.
 *
 * A link points from the parent to the child when one is a known parent of the other,
 * and otherwise from the shape that was put on the canvas first.
 *
 * @param canvasState - The shapes on the canvas, keyed by id
 * @returns The links between them
 */
export const getLinks = (canvasState: Map<string, ServiceEntityShape>): ComposerLink[] => {
  const links: ComposerLink[] = [];
  const linkedPairs = new Set<string>();

  canvasState.forEach((shape, shapeId) => {
    shape.connections.forEach((targetIds) => {
      targetIds.forEach((targetId) => {
        const targetShape = canvasState.get(targetId);

        if (!targetShape || targetId === shapeId) {
          return;
        }

        const pair = [shapeId, targetId].sort().join("|");

        if (linkedPairs.has(pair)) {
          return;
        }
        linkedPairs.add(pair);

        const isChildOfTarget =
          shape.parentIds.has(targetId) && !targetShape.parentIds.has(shapeId);
        const [source, target] = isChildOfTarget ? [targetId, shapeId] : [shapeId, targetId];

        links.push({ id: `${source}->${target}`, source, target });
      });
    });
  });

  return links;
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
