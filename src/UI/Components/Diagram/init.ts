import { dia, shapes, ui } from "@clientio/rappid";
import { AttributeModel, ServiceInstanceModel } from "@/Core";
import { appendInstance, showLinkTools } from "./actions";
import { anchorNamespace } from "./anchors";
import { routerNamespace } from "./routers";
import { Link } from "./shapes";

export default function diagramInit(canvas) {
  const graph = new dia.Graph({}, { cellNamespace: shapes });

  const paper = new dia.Paper({
    model: graph,
    width: 1000,
    height: 800,
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
    defaultLink: () => new Link(),
    validateConnection: function (srcView, srcMagnet, tgtView, tgtMagnet) {
      return srcMagnet !== tgtMagnet;
    },
  });

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

  function zoom(x: number, y: number, delta: number) {
    scroller.zoom(delta * 0.2, { min: 0.4, max: 1.2, grid: 0.2, ox: x, oy: y });
  }

  paper.unfreeze();
  return {
    removeCanvas: () => {
      scroller.remove();
      paper.remove();
    },
    addInstance: (
      instance: ServiceInstanceModel,
      attributesToDisplay: AttributeModel[]
    ) => {
      const attributeNames = attributesToDisplay.map(
        (attribute) => attribute.name
      );
      appendInstance(graph, instance, attributeNames);
    },
  };
}
