import { g, dia, anchors } from "@clientio/rappid";

export const anchorNamespace = { ...anchors };

const customAnchor = function (
  /* eslint-disable @typescript-eslint/no-explicit-any */
  this: any,
  view: dia.ElementView,
  magnet: SVGElement,
  ref: g.Point
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
