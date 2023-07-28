import { dia, shapes, ui } from "@inmanta/rappid";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithReferences } from "@/Data/Managers/GetInstanceWithRelations/interface";
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
    gridSize: 1,
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
    magnetThreshold: 0,
    highlighting: {
      connecting: {
        name: "addClass",
        options: {
          className: "column-connected",
        },
      },
    },
    defaultLink: () => new EntityConnection(),
    validateConnection: (srcView, srcMagnet, tgtView, tgtMagnet) => {
      return srcMagnet !== tgtMagnet && srcView.cid !== tgtView.cid;
    },
  });

  /**
   * https://resources.jointjs.com/docs/rappid/v3.6/ui.PaperScroller.html
   */
  const scroller = new ui.PaperScroller({
    paper,
    cursor: "grab",
    baseWidth: 1000,
    baseHeight: 1000,
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

  new ui.Tooltip({
    rootTarget: ".canvas",
    target: "[data-tooltip]",
    padding: 20,
  });

  paper.on(
    "element:showDict",
    (_elementView: dia.ElementView, event: dia.Event) => {
      document.dispatchEvent(
        new CustomEvent("openDictsModal", {
          detail: event.target.parentElement.attributes.dict.value,
        }),
      );
    },
  );

  paper.on("cell:pointerup", function (cellView) {
    // We don't want a Halo for links.
    if (cellView.model instanceof dia.Link) return;

    const halo = new ui.Halo({
      cellView: cellView,
      type: "toolbar",
    });

    halo.removeHandle("clone");
    halo.removeHandle("resize");
    halo.removeHandle("rotate");
    halo.removeHandle("fork");
    halo.removeHandle("unlink");

    halo.addHandle({
      name: "edit",
      position: ui.Halo.HandlePosition.S,
    });

    // additional listeners to add logic for appended tools, if there will be need for any validation on remove then I think we will need custom handle anyway
    // halo.on("action:remove:pointerdown", function (evt) {
    // });
    // halo.on("action:link:pointerdown", function (evt) {
    // });
    // halo.on("action:link:add", function (evt) {
    // });

    halo.on("action:edit:pointerdown", function (evt) {
      evt.stopPropagation();
      console.log("open edit form");
    });

    halo.render();
  });

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
    },
  );

  paper.on(
    "cell:mousewheel",
    (_, evt: dia.Event, ox: number, oy: number, delta: number) => {
      evt.preventDefault();
      zoom(ox, oy, delta);
    },
  );

  /**
   * Function that zooms in/out the view of canvas
   * @param {number} x - x coordinate
   * @param {number} y - y coordinate
   * @param {number} delta - the value that dictates how big the zoom has to be.
   */
  function zoom(x: number, y: number, delta: number) {
    scroller.zoom(delta * 0.05, {
      min: 0.4,
      max: 1.2,
      grid: 0.05,
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
      instance: InstanceWithReferences,
      services: ServiceModel[],
      isMainInstance: boolean,
    ) => {
      const appendedInstance = appendInstance(
        paper,
        graph,
        instance,
        services,
        isMainInstance,
      );
      const { x, y } = appendedInstance.getBBox();
      scroller.center(x, y + 200);
    },

    addEntity: (instance, service, addingCoreInstance) => {
      const instanceCoordinates = appendEntity(
        paper,
        graph,
        service,
        instance,
        addingCoreInstance,
      );
      scroller.center(instanceCoordinates.x, instanceCoordinates.y + 200);
    },
    zoom: (delta) => {
      scroller.zoom(0.05 * delta, { min: 0.4, max: 1.2, grid: 0.05 });
    },
  };
}

export interface DiagramHandlers {
  removeCanvas: () => void;
  addInstance: (
    instance: InstanceWithReferences,
    services: ServiceModel[],
    isMainInstance: boolean,
  ) => void;
  addEntity: (
    entity: InstanceAttributeModel,
    service: ServiceModel,
    addingCoreInstance: boolean,
  ) => void;
  zoom: (delta: 1 | -1) => void;
}
