/* istanbul ignore file */
//above comment is to ignore this file from test coverage as it's a JointJS file that is hard to test with Jest due to the fact that JointJS base itself on native browser functions that aren't supported by Jest environement
import { g, dia, anchors } from "@inmanta/rappid";

export const anchorNamespace = { ...anchors };

/**
 *  creates new custom anchor
 *  https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#anchors.custom
 */
const customAnchor = function (
  /* eslint-disable @typescript-eslint/no-explicit-any */
  this: any,
  view: dia.ElementView,
  magnet: SVGElement,
  ref: g.Point,
) {
  const { model } = view;
  const bbox = view.getNodeUnrotatedBBox(magnet);
  const center = model.getBBox().center();
  const angle = model.angle();
  let refPoint = ref;

  if (ref instanceof Element) {
    const refView = this.paper.findView(ref);

    refPoint = refView ? refView.getNodeBBox(ref).center() : new g.Point();
  }

  refPoint.rotate(center, angle);
  const anchor =
    refPoint.x <= bbox.x + bbox.width ? bbox.leftMiddle() : bbox.rightMiddle();

  return anchor.rotate(center, -angle);
};

Object.assign(anchorNamespace, {
  customAnchor,
});
