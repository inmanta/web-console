import dagre from "@dagrejs/dagre";
import { SHAPE_WIDTH, SHAPE_MIN_HEIGHT } from "../../config";
import {
  HORIZONTAL_SPACING,
  LAYER_SPACING,
  SIBLING_SPACING,
  VERTICAL_SPACING,
} from "../../config/layoutConfig";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { getConnectedLayerData } from "./layerUtils";
import { getLinks } from "./linkUtils";
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
 * The direction the layered layout grows in: left to right, or top to bottom.
 */
export type LayoutDirection = "LR" | "TB";

/**
 * Applies saved coordinates from metadata to the shapes on the canvas
 * Skips embedded entities (they will be positioned via autolayout. They don't have persistent ids.)
 *
 * @param canvasState - The shapes on the canvas
 * @param coordinates - Array of saved coordinates from metadata
 */
export const applyCoordinatesFromMetadata = (
  canvasState: Map<string, ServiceEntityShape>,
  coordinates: SavedCoordinates[]
): void => {
  coordinates.forEach((savedCoord) => {
    const shape = canvasState.get(String(savedCoord.id));

    if (!shape || shape.entityType === "embedded") {
      return;
    }
    shape.setPosition(savedCoord.coordinates.x, savedCoord.coordinates.y);
  });
};

/**
 * Positions embedded entities to the right of their parent entities
 * Uses the same positioning logic as createEmbeddedEntityShapes
 *
 * @param canvasState - The shapes on the canvas
 */
export const applyAutoLayoutToEmbeddedEntities = (
  canvasState: Map<string, ServiceEntityShape>
): void => {
  const shapes = Array.from(canvasState.values());
  const embeddedEntities = shapes.filter((shape) => shape.entityType === "embedded");

  // If there are no embedded entities, nothing to do
  if (embeddedEntities.length === 0) {
    return;
  }

  // Create a position tracker and populate it with all existing shape positions
  const positionTracker = new PositionTracker(VERTICAL_SPACING, SHAPE_WIDTH, SHAPE_MIN_HEIGHT);
  shapes.forEach((shape) => {
    if (shape.entityType !== "embedded") {
      const pos = shape.getPosition();
      const { width, height } = getShapeDimensions(shape);
      positionTracker.reserve(shape.id, pos.x, pos.y, width, height);
    }
  });

  // Group the embedded entities by the non-embedded shape that links to them
  const embeddedByParent = new Map<string, ServiceEntityShape[]>();
  const links = getLinks(canvasState);

  embeddedEntities.forEach((embeddedEntity) => {
    const parentLink = links.find(
      (link) =>
        link.target === embeddedEntity.id && canvasState.get(link.source)?.entityType !== "embedded"
    );

    if (!parentLink) {
      return;
    }
    embeddedByParent.set(parentLink.source, [
      ...(embeddedByParent.get(parentLink.source) || []),
      embeddedEntity,
    ]);
  });

  // Position embedded entities relative to their parents
  embeddedByParent.forEach((embeddedList, parentId) => {
    const parent = canvasState.get(parentId);
    if (!parent) {
      return;
    }

    const parentPos = parent.getPosition();
    const offsetX = parentPos.x + HORIZONTAL_SPACING;

    // Sort embedded entities by their current Y position to maintain relative order
    embeddedList.sort((a, b) => a.getPosition().y - b.getPosition().y);

    // Position each embedded entity, stacking them vertically
    embeddedList.forEach((embeddedEntity, index) => {
      const startY = parentPos.y + index * VERTICAL_SPACING;
      const finalY = positionTracker.findNextYPosition(
        offsetX,
        SHAPE_WIDTH,
        SHAPE_MIN_HEIGHT,
        startY
      );

      embeddedEntity.setPosition(offsetX, finalY);

      const { width, height } = getShapeDimensions(embeddedEntity);
      positionTracker.reserve(embeddedEntity.id, offsetX, finalY, width, height);
    });
  });
};

/**
 * Lays the shapes out in layers by relation depth: each link points from one layer to the
 * next, and the order within a layer keeps links from crossing where it can.
 * Shapes hidden by a collapsed parent keep their position.
 *
 * With a root, only the root and everything below it move, and the root stays where it is.
 *
 * @param canvasState - The shapes on the canvas
 * @param direction - Left to right, or top to bottom
 * @param rootId - The shape whose subtree to arrange; the whole canvas when omitted
 * @returns The ids of the shapes that moved
 */
export const applyLayeredLayout = (
  canvasState: Map<string, ServiceEntityShape>,
  direction: LayoutDirection = "LR",
  rootId?: string
): string[] => {
  const root = rootId ? canvasState.get(rootId) : undefined;
  const scope = root
    ? [root, ...getConnectedLayerData(canvasState, root).shapes]
    : Array.from(canvasState.values());
  const shapes = scope.filter((shape) => !shape.isHidden);

  if (shapes.length === 0) {
    return [];
  }

  const ids = new Set(shapes.map((shape) => shape.id));
  const graph = new dagre.graphlib.Graph();

  graph.setGraph({
    rankdir: direction,
    nodesep: SIBLING_SPACING,
    ranksep: LAYER_SPACING,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  shapes.forEach((shape) => {
    graph.setNode(shape.id, getShapeDimensions(shape));
  });
  getLinks(canvasState)
    .filter((link) => ids.has(link.source) && ids.has(link.target))
    .forEach((link) => graph.setEdge(link.source, link.target));

  dagre.layout(graph);

  // dagre places the node centres from the origin. Keep the arranged block where it was:
  // anchored on the root, or on the top-left corner of the shapes it arranged.
  const topLeft = (positions: Array<{ x: number; y: number }>) => ({
    x: Math.min(...positions.map(({ x }) => x)),
    y: Math.min(...positions.map(({ y }) => y)),
  });
  const laidOut = new Map(
    shapes.map((shape) => {
      const { x, y } = graph.node(shape.id);
      const { width, height } = getShapeDimensions(shape);

      return [shape.id, { x: x - width / 2, y: y - height / 2 }];
    })
  );
  const anchorBefore = root
    ? root.getPosition()
    : topLeft(shapes.map((shape) => shape.getPosition()));
  const anchorAfter = root ? laidOut.get(root.id)! : topLeft(Array.from(laidOut.values()));

  shapes.forEach((shape) => {
    const { x, y } = laidOut.get(shape.id)!;

    shape.setPosition(
      Math.round(x - anchorAfter.x + anchorBefore.x),
      Math.round(y - anchorAfter.y + anchorBefore.y)
    );
  });

  return shapes.map((shape) => shape.id);
};
