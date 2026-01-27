/* istanbul ignore file */
//above comment is to ignore this file from test coverage as it's a JointJS file that is hard to test with Jest due to the fact that JointJS base itself on native browser functions that aren't supported by Jest environement
import { g, dia, anchors } from "@inmanta/rappid";

export const anchorNamespace = { ...anchors };

/**
 *  creates new custom anchor
 *  https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#anchors.custom
 */
const customAnchor = function (
  this: { paper: dia.Paper },
  view: dia.ElementView,
  magnet: SVGElement,
  ref: g.Point | SVGElement
) {
  const { model } = view;
  const magnetBbox = view.getNodeUnrotatedBBox(magnet);
  const magnetCenterY = magnetBbox.center().y;
  const shapeBbox = model.getBBox();
  const shapeCenter = shapeBbox.center();
  const angle = model.angle();
  let refPoint: g.Point;

  if (ref instanceof SVGElement) {
    const refView = this.paper.findView(ref);
    refPoint = refView ? refView.getNodeBBox(ref).center() : new g.Point();
  } else {
    refPoint = ref;
  }

  // Rotate reference point to shape's coordinate system
  refPoint.rotate(shapeCenter, angle);

  // Determine which side of the shape to use based on reference point position
  // Use the magnet's Y position (port position) but the shape's left or right edge
  const useLeft = refPoint.x <= shapeCenter.x;
  const anchorX = useLeft ? shapeBbox.x : shapeBbox.x + shapeBbox.width;
  const anchor = new g.Point(anchorX, magnetCenterY);

  // Rotate back to global coordinate system
  return anchor.rotate(shapeCenter, -angle);
};

Object.assign(anchorNamespace, {
  customAnchor,
});
