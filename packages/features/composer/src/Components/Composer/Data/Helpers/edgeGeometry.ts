/**
 * A card on the canvas: its top-left corner and its size.
 */
export interface CardBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Whether the canvas reads left to right (each layer beside the previous one) or top to
 * bottom (each layer below the previous one).
 */
export type LayoutAxis = "horizontal" | "vertical";

export type CardSide = "left" | "right" | "top" | "bottom";

/**
 * Where a line meets a card: a point on one of its sides.
 */
export interface EdgeAnchor {
  x: number;
  y: number;
  side: CardSide;
}

/**
 * How far apart two cards are: the distance between their centres, and the gap between
 * their edges on each axis, negative where the cards overlap on that axis.
 */
const getGaps = (from: CardBox, to: CardBox) => {
  const dx = to.x + to.width / 2 - (from.x + from.width / 2);
  const dy = to.y + to.height / 2 - (from.y + from.height / 2);

  return {
    dx,
    dy,
    horizontalGap: Math.abs(dx) - (from.width + to.width) / 2,
    verticalGap: Math.abs(dy) - (from.height + to.height) / 2,
  };
};

/**
 * Reads the direction the canvas is laid out in from its connections. A connection between cards that are
 * beside each other, at overlapping heights, says left to right; one between cards stacked
 * above each other says top to bottom. Connections between cards that are apart on both axes say
 * nothing. Left to right, the direction the composer arranges in, unless most connections say
 * otherwise.
 *
 * @param connections - The two cards of each connection on the canvas
 * @returns The axis along which the layers follow each other
 */
export const getLayoutAxis = (connections: Array<[CardBox, CardBox]>): LayoutAxis => {
  const balance = connections.reduce((sum, [from, to]) => {
    const { horizontalGap, verticalGap } = getGaps(from, to);

    if (horizontalGap > 0 && verticalGap <= 0) {
      return sum + 1;
    }
    if (verticalGap > 0 && horizontalGap <= 0) {
      return sum - 1;
    }

    return sum;
  }, 0);

  return balance >= 0 ? "horizontal" : "vertical";
};

/**
 * Picks the sides of two linked cards that the line runs between, and the middle of each.
 * Cards apart on one axis only are joined on the sides that face each other. Cards apart on
 * both axes are joined along the layout axis: left to right, a card far below its parent is
 * still entered from the side, so the line doesn't pass between the cards stacked next to it.
 *
 * @param from - The card the line starts at
 * @param to - The card the line ends at
 * @param layoutAxis - The direction the canvas is laid out in (getLayoutAxis)
 * @returns The start and end of the line
 */
export const getEdgeAnchors = (
  from: CardBox,
  to: CardBox,
  layoutAxis: LayoutAxis
): [EdgeAnchor, EdgeAnchor] => {
  const { dx, dy, horizontalGap, verticalGap } = getGaps(from, to);
  const horizontal =
    horizontalGap > 0 && verticalGap > 0
      ? layoutAxis === "horizontal"
      : horizontalGap >= verticalGap;

  if (horizontal) {
    const right = dx >= 0;

    return [
      {
        x: right ? from.x + from.width : from.x,
        y: from.y + from.height / 2,
        side: right ? "right" : "left",
      },
      {
        x: right ? to.x : to.x + to.width,
        y: to.y + to.height / 2,
        side: right ? "left" : "right",
      },
    ];
  }

  const down = dy >= 0;

  return [
    {
      x: from.x + from.width / 2,
      y: down ? from.y + from.height : from.y,
      side: down ? "bottom" : "top",
    },
    {
      x: to.x + to.width / 2,
      y: down ? to.y : to.y + to.height,
      side: down ? "top" : "bottom",
    },
  ];
};
