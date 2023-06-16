import { dia, shapes, ui } from "@inmanta/rappid";
import {
  InstanceAttributeModel,
  ServiceInstanceModel,
  ServiceModel,
} from "@/Core";
// import { testInstance, testService } from "./Mock";
import { appendEntity, appendInstance, showLinkTools } from "./actions";
import { anchorNamespace } from "./anchors";
import { routerNamespace } from "./routers";
import { EntityConnection } from "./shapes";

export default function diagramInit(canvas): DiagramHandlers {
  /**
   * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Graph
   */
  const graph = new dia.Graph({}, { cellNamespace: shapes });

  /**
   * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Paper
   */
  const paper = new dia.Paper({
    model: graph,
    width: 1000,
    height: 1000,
    gridSize: 20,
    interactive: true,
    defaultConnector: { name: "rounded" },
    async: true,
    frozen: true,
    sorting: dia.Paper.sorting.APPROX,
    cellViewNamespace: shapes,
    routerNamespace: routerNamespace,
    defaultRouter: { name: "customRouter" },
    anchorNamespace: anchorNamespace,
    defaultAnchor: { name: "customAnchor" },
    snapLinks: true,
    linkPinning: false,
    magnetThreshold: "onleave",
    highlighting: {
      connecting: {
        name: "addClass",
        options: {
          className: "column-connected",
        },
      },
    },
    defaultLink: () => new EntityConnection(),
    validateConnection: (_srcView, srcMagnet, _tgtView, tgtMagnet) =>
      srcMagnet !== tgtMagnet,
  });

  /**
   * https://resources.jointjs.com/docs/rappid/v3.6/ui.PaperScroller.html
   */
  const scroller = new ui.PaperScroller({
    paper,
    cursor: "grab",
    baseWidth: 100,
    baseHeight: 100,
    inertia: { friction: 0.8 },
    autoResizePaper: true,
    contentOptions: function () {
      return {
        useModelGeometry: true,
        allowNewOrigin: "any",
        padding: 40,
        allowNegativeBottomRight: true,
      };
    },
  });
  canvas.current.appendChild(scroller.el);
  scroller.render().center();
  scroller.centerContent();

  paper.on("link:mouseenter", (linkView: dia.LinkView) => {
    showLinkTools(linkView);
  });

  paper.on("link:mouseleave", (linkView: dia.LinkView) => {
    linkView.removeTools();
  });

  paper.on("blank:pointerdown", (evt: dia.Event) => scroller.startPanning(evt));

  paper.on(
    "blank:mousewheel",
    (evt: dia.Event, ox: number, oy: number, delta: number) => {
      evt.preventDefault();
      zoom(ox, oy, delta);
    }
  );

  paper.on(
    "cell:mousewheel",
    (_, evt: dia.Event, ox: number, oy: number, delta: number) => {
      evt.preventDefault();
      zoom(ox, oy, delta);
    }
  );

  /**
   * Function that zooms in/out the view of canvas
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @param {number} delta - the value that dictates how big the zoom has to be.
   */
  function zoom(x: number, y: number, delta: number) {
    scroller.zoom(delta * 0.06, {
      min: 0.4,
      max: 1.2,
      grid: 0.06,
      ox: x,
      oy: y,
    });
  }

  paper.unfreeze();
  return {
    removeCanvas: () => {
      scroller.remove();
      paper.remove();
    },
    addInstance: (
      instance: ServiceInstanceModel,
      service: ServiceModel,
      attrsToDisplay: "candidate_attributes" | "active_attributes"
    ) => {
      const instanceCoordinates = appendInstance(
        paper,
        graph,
        instance,
        service,
        attrsToDisplay
      );
      // const instanceCoordinates = appendInstance(
      //   paper,
      //   graph,
      //   testInstance,
      //   testService,
      //   attrsToDisplay
      // );
      scroller.center(instanceCoordinates.x, instanceCoordinates.y + 200);
    },
    addEntity: (instance, service) => {
      const instanceCoordinates = appendEntity(paper, graph, service, instance);
      scroller.center(instanceCoordinates.x, instanceCoordinates.y + 200);
    },
  };
}

export interface DiagramHandlers {
  removeCanvas: () => void;
  addInstance: (
    instance: ServiceInstanceModel,
    service: ServiceModel,
    attrsToDisplay: "candidate_attributes" | "active_attributes"
  ) => void;
  addEntity: (entity: InstanceAttributeModel, service: ServiceModel) => void;
}
