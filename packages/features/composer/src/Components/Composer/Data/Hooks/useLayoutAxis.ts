import { useCallback, useMemo, useRef } from "react";
import { CardBox, getLayoutAxis, getLinks, getShapeDimensions, LayoutAxis } from "../Helpers";
import { Point, ServiceEntityShape } from "../ServiceEntityShape";

interface ReadLayout {
  axis: LayoutAxis;

  /** The ids of the links, in order */
  links: string;

  /** Where each visible card was, moved along by drags */
  positions: Map<string, Point>;
}

/**
 * The direction the canvas is laid out in (getLayoutAxis), read again only when the layout
 * changes: cards placed without a drag (a load, an Arrange, an undo, new cards), a link
 * added or removed, or cards shown or hidden. A drag or an attribute edit keeps it, so
 * dragging a card only moves its own lines, and doesn't turn the other lines of the canvas to
 * the other axis.
 *
 * @param canvasState - The shapes on the canvas
 * @returns The layout axis, and the callback that tells it a card was dragged
 */
export const useLayoutAxis = (canvasState: Map<string, ServiceEntityShape>) => {
  const readLayout = useRef<ReadLayout | null>(null);

  const layoutAxis = useMemo(() => {
    const shapes = Array.from(canvasState.values()).filter((shape) => !shape.isHidden);
    const links = getLinks(canvasState);
    const linkIds = links.map((link) => link.id).join();
    const previous = readLayout.current;
    const isUnchanged =
      previous !== null &&
      previous.links === linkIds &&
      previous.positions.size === shapes.length &&
      shapes.every((shape) => {
        const known = previous.positions.get(shape.id);
        const { x, y } = shape.getPosition();

        return known !== undefined && known.x === x && known.y === y;
      });

    if (isUnchanged) {
      return previous.axis;
    }

    const boxes = new Map(
      shapes.map((shape): [string, CardBox] => [
        shape.id,
        { ...shape.getPosition(), ...getShapeDimensions(shape) },
      ])
    );
    const axis = getLayoutAxis(
      links.flatMap((link): Array<[CardBox, CardBox]> => {
        const source = boxes.get(link.source);
        const target = boxes.get(link.target);

        return source && target ? [[source, target]] : [];
      })
    );

    readLayout.current = {
      axis,
      links: linkIds,
      positions: new Map(shapes.map((shape) => [shape.id, shape.getPosition()])),
    };

    return axis;
  }, [canvasState]);

  /**
   * Records where a dragged card is now, so the move isn't taken for a new layout.
   */
  const onCardDragged = useCallback((id: string, position: Point) => {
    const positions = readLayout.current?.positions;

    if (positions?.has(id)) {
      positions.set(id, { ...position });
    }
  }, []);

  return { layoutAxis, onCardDragged };
};
