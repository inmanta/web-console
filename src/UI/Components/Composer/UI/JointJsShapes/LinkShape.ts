import { dia, shapes, g } from "@inmanta/rappid";

interface LinkAttributeContext {
  model: dia.Link;
}

interface LabelLinkView extends dia.LinkView {
  sourceView: dia.CellView;
  targetView: dia.CellView;
  sourcePoint: g.Rect;
  targetPoint: g.Rect;
}

/**
 * Updates the position of a label relative to a link's target or source side.
 *
 * @param {"target" | "source"} side - The side of the link where the label is positioned. Can be "target" or "source".
 * @param {g.Rect} _refBBox - The bounding box of a reference element (unused).
 * @param {SVGSVGElement} node - The SVG element representing the label.
 * @param {{ [key: string]: unknown }} _attrs - Additional attributes for the label (unused).
 * @param {LabelLinkView} linkView - The view representing the link associated with the label.
 * @returns {{ textAnchor: "start" | "end", x: number, y: number }} - An object containing the updated attributes for the label.
 */
const updateLabelPosition = (
  side: "target" | "source",
  _refBBox: g.Rect,
  _node: SVGSVGElement,
  _attrs: { [key: string]: unknown },
  linkView: LabelLinkView //dia.LinkView & dia.Link doesn't have sourceView or targetView properties in the model
): { textAnchor: "start" | "end"; x: number; y: number } => {
  let textAnchor, tx, ty, viewCoordinates, anchorCoordinates;

  if (side === "target") {
    viewCoordinates = linkView.targetView.model.position();
    anchorCoordinates = linkView.targetPoint;
  } else {
    viewCoordinates = linkView.sourceView.model.position();
    anchorCoordinates = linkView.sourcePoint;
  }

  if (viewCoordinates && anchorCoordinates) {
    if (viewCoordinates.x !== anchorCoordinates.x) {
      textAnchor = "start";
      tx = 15;
    } else {
      textAnchor = "end";
      tx = -15;
    }
  }

  const isTargetBelow = linkView.getEndAnchor("target").y < linkView.getEndAnchor("source").y;

  switch (side) {
    case "target":
      ty = isTargetBelow ? -15 : 15;
      break;
    case "source":
      ty = isTargetBelow ? 15 : -15;
      break;
  }

  return { textAnchor: textAnchor, x: tx || 0, y: ty || 0 };
};

/**
 * Represents the Link shape in the Composer, the lines connecting the entities.
 *
 * @extends shapes.standard.Link
 * @class Link
 * @memberof shapes
 * @see shapes.standard.Link
 */
export const LinkShape = shapes.standard.Link.define(
  "Link",
  {
    // attributes
    z: -1,
    attrs: {
      wrapper: {
        connection: true,
        strokeWidth: 10,
      },
      line: {
        class: "joint-link-line",
        targetMarker: {
          class: "joint-link-marker",
          type: "path",
          d: "M 0 -5 10 0 0 5 z",
        },
        sourceMarker: {
          class: "joint-link-marker",
          type: "path",
          d: "M 0 -5 10 0 0 5 z",
        },
        connection: true,
        strokeWidth: 2,
      },
    },
  },
  {
    // prototype
  },
  {
    // static
    attributes: {
      "auto-orient": {
        qualify: function (this: LinkAttributeContext) {
          return this.model.isLink();
        },
        set: updateLabelPosition,
      },
    },
  }
);

const LinkView = dia.LinkView.extend({
  update(...theArgs) {
    dia.LinkView.prototype.update.apply(this, theArgs as []);
    this.updateLabels();
  },
});

Object.assign(shapes, {
  LinkView,
  LinkShape,
});
