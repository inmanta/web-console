import { dia, g, routers } from "@inmanta/rappid";
import { RouterOptions } from "./interfaces";

const DEFAULT_PADDING = 30;

export const routerNamespace = { ...routers };

/**
 * Function that returns points on canvas where connection between entities are anchored
 * @param {g.Rect} bbox - The bounding box of the element model
 * @param {number} angle - The rotation of the element in degrees
 * @param {g.Point} anchor - Point object with x and y coordinates that represent anchor of given entity
 * @param {number} padding - padding of the Link
 * @returns {g.Point}
 */
function getOutsidePoint(
  bbox: g.Rect,
  angle: number,
  anchor: g.Point,
  padding: number
) {
  const ref = anchor.clone();
  const center = bbox.center();

  if (angle) {
    ref.rotate(center, angle);
  }
  const point = new g.Point(bbox.x, ref.y);

  if (point.equals(anchor)) {
    point.x--;
    padding--;
  }

  point.move(ref, ref.x < center.x ? padding : -bbox.width - padding);
  if (angle) {
    point.rotate(center, -angle);
  }

  return point.round();
}

/**
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#routers.custom
 */
const customRouter = function (
  vertices: Array<g.Point>,
  routerOptions: RouterOptions,
  linkView: dia.LinkView
) {
  const link = linkView.model;
  const route: g.Point[] = [];

  // Target Point
  const source = link.getSourceElement();
  if (source) {
    route.push(
      getOutsidePoint(
        source.getBBox(),
        source.angle(),
        linkView.getEndAnchor("source"),
        routerOptions.padding || routerOptions.sourcePadding || DEFAULT_PADDING
      )
    );
  }

  // Adding the vertices to the route Array
  Array.prototype.push.apply(route, vertices);

  // Source Point
  const target = link.getTargetElement();

  if (target) {
    route.push(
      getOutsidePoint(
        target.getBBox(),
        target.angle(),
        linkView.getEndAnchor("target"),
        routerOptions.padding || routerOptions.targetPadding || DEFAULT_PADDING
      )
    );
  }

  return route;
};

Object.assign(routerNamespace, {
  customRouter,
});
