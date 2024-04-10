import { dia, shapes, ui } from "@inmanta/rappid";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithReferences } from "@/Data/Managers/GetInstanceWithRelations/interface";
import {
  appendColumns,
  appendEntity,
  appendInstance,
  showLinkTools,
} from "./actions";
import { anchorNamespace } from "./anchors";
import createHalo from "./halo";
import {
  applyCoordinatesToCells,
  checkIfConnectionIsAllowed,
  getCellsCoordinates,
  toggleLooseElement,
} from "./helpers";
import collapseButton from "./icons/collapse-icon.svg";
import expandButton from "./icons/expand-icon.svg";
import {
  ActionEnum,
  ConnectionRules,
  TypeEnum,
  serializedCell,
} from "./interfaces";
import { routerNamespace } from "./routers";
import { Link, ServiceEntityBlock } from "./shapes";

export default function diagramInit(
  canvas,
  connectionRules: ConnectionRules,
  updateInstancesToSend: (cell: ServiceEntityBlock, action: ActionEnum) => void,
  editable: boolean,
): DiagramHandlers {
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
    interactive: { linkMove: false },
    defaultConnectionPoint: {
      name: "boundary",
      args: {
        extrapolate: true,
        sticky: true,
      },
    },
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
    background: { color: "transparent" },
    highlighting: {
      connecting: {
        name: "addClass",
        options: {
          className: "column-connected",
        },
      },
    },
    defaultLink: () => new Link(),
    validateConnection: (srcView, srcMagnet, tgtView, tgtMagnet) => {
      const baseValidators =
        srcMagnet !== tgtMagnet && srcView.cid !== tgtView.cid;

      const srcViewAsElement = graph
        .getElements()
        .find((element) => element.cid === srcView.model.cid);

      //find srcView as Element to get Neighbors and check if it's already connected to the target
      if (srcViewAsElement) {
        const connectedElements = graph.getNeighbors(srcViewAsElement);
        const isConnected = connectedElements.find(
          (connectedElement) => connectedElement.cid === tgtView.model.cid,
        );
        const isAllowed = checkIfConnectionIsAllowed(
          graph,
          tgtView,
          srcView,
          connectionRules,
        );

        return isConnected === undefined && isAllowed && baseValidators;
      }
      return baseValidators;
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

  paper.on(
    "element:toggleButton:pointerdown",
    (elementView: dia.ElementView, event: dia.Event) => {
      event.preventDefault();
      const elementAsShape = elementView.model as ServiceEntityBlock;

      const isCollapsed = elementAsShape.get("isCollapsed");
      const originalAttrs = elementAsShape.get("dataToDisplay");

      elementAsShape.appendColumns(
        isCollapsed ? originalAttrs : originalAttrs.slice(0, 4),
        false,
      );
      elementAsShape.attr(
        "toggleButton/xlink:href",
        isCollapsed ? collapseButton : expandButton,
      );

      const bbox = elementAsShape.getBBox();
      elementAsShape.attr("toggleButton/y", bbox.height - 24);
      elementAsShape.attr("spacer/y", bbox.height - 33);

      elementAsShape.set("isCollapsed", !isCollapsed);
    },
  );

  paper.on("cell:pointerup", function (cellView) {
    // We don't want a Halo if cellView is a Link or is a representation of an already existing instance that has strict_modifier set to false
    if (
      cellView.model instanceof dia.Link ||
      cellView.model.get("isBlockedFromEditing")
    )
      return;
    if (cellView.model.get("isBlockedFromEditing") || !editable) return;
    const halo = createHalo(
      graph,
      paper,
      cellView,
      connectionRules,
      updateInstancesToSend,
    );

    halo.render();
  });

  paper.on("link:mouseenter", (linkView) => {
    const source = linkView.model.source();
    const target = linkView.model.target();

    const sourceCell = graph.getCell(
      source.id as dia.Cell.ID,
    ) as ServiceEntityBlock;
    const targetCell = graph.getCell(
      target.id as dia.Cell.ID,
    ) as ServiceEntityBlock;
    if (!(sourceCell.getName()[0] === "_")) {
      linkView.model.appendLabel({
        attrs: {
          rect: {
            fill: "none",
          },
          text: {
            text: sourceCell.getName(),
            autoOrient: "target",
            class: "joint-label-text",
          },
        },
        position: {
          distance: 1,
        },
      });
    }
    if (!(targetCell.getName()[0] === "_")) {
      linkView.model.appendLabel({
        attrs: {
          rect: {
            fill: "none",
          },
          text: {
            text: targetCell.getName(),
            autoOrient: "source",
            class: "joint-label-text",
          },
        },
        position: {
          distance: 0,
        },
      });
    }
    if (linkView.model.get("isBlockedFromEditing") || !editable) return;
    showLinkTools(
      paper,
      graph,
      linkView,
      updateInstancesToSend,
      connectionRules,
    );
  });

  paper.on("link:mouseleave", (linkView: dia.LinkView) => {
    linkView.removeTools();
    linkView.model.labels([]);
  });

  paper.on("link:connect", (linkView: dia.LinkView) => {
    //only id values are stored in the linkView
    const source = linkView.model.source();
    const target = linkView.model.target();

    const sourceCell = graph.getCell(
      source.id as dia.Cell.ID,
    ) as ServiceEntityBlock;
    const targetCell = graph.getCell(
      target.id as dia.Cell.ID,
    ) as ServiceEntityBlock;

    /**
     * Function that checks if cell that we are connecting  to is being the one storing information about said connection.
     * @param elementCell cell that we checking
     * @param connectingCell cell that is being connected to elementCell
     * @returns boolean whether connections was set
     */
    const wasConnectionDataAssigned = (
      elementCell: ServiceEntityBlock,
      connectingCell: ServiceEntityBlock,
    ): boolean => {
      const cellRelations = elementCell.getRelations();
      const cellName = elementCell.getName();
      const connectingCellName = connectingCell.getName();

      //if cell has Map that mean it can accept inter-service relations
      if (cellRelations) {
        const cellConnectionRule = connectionRules[cellName].find(
          (rule) => rule.name === connectingCellName,
        );

        //if there is corresponding rule we can apply connection and update given service
        if (
          cellConnectionRule &&
          cellConnectionRule.kind === TypeEnum.INTERSERVICE
        ) {
          elementCell.addRelation(
            connectingCell.id as string,
            cellConnectionRule.attributeName,
          );

          updateInstancesToSend(sourceCell, ActionEnum.UPDATE);
          return true;
        }
      }

      if (
        elementCell.get("isEmbedded") &&
        elementCell.get("embeddedTo") !== null
      ) {
        elementCell.set("embeddedTo", connectingCell.id);
        toggleLooseElement(paper.findViewByModel(elementCell), "remove");
        updateInstancesToSend(elementCell, ActionEnum.UPDATE);
        return true;
      } else {
        return false;
      }
    };

    const wasConnectionFromSourceSet = wasConnectionDataAssigned(
      sourceCell,
      targetCell,
    );
    if (!wasConnectionFromSourceSet) {
      wasConnectionDataAssigned(targetCell, sourceCell);
    }
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
      appendInstance(paper, graph, instance, services, isMainInstance);
      const savedInstancesCoordinates = localStorage.getItem(
        instance.instance.id,
      );
      if (savedInstancesCoordinates) {
        const parsedCoordinates = JSON.parse(savedInstancesCoordinates);
        applyCoordinatesToCells(graph, parsedCoordinates);
      }
      scroller.zoomToFit({
        useModelGeometry: true,
        padding: 20,
        scaleGrid: 0.05,
        minScaleX: 0.4,
        minScaleY: 0.4,
        maxScaleX: 1.2,
        maxScaleY: 1.2,
      });

      const jsonGraph = graph.toJSON();
      return jsonGraph.cells as serializedCell[];
    },

    addEntity: (
      instance,
      service,
      addingCoreInstance,
      isEmbedded,
      holderName,
    ) => {
      const shape = appendEntity(
        graph,
        service,
        instance,
        addingCoreInstance,
        isEmbedded,
        holderName,
      );
      if (shape.get("isEmbedded")) {
        toggleLooseElement(paper.findViewByModel(shape), "add");
      }
      const shapeCoordinates = shape.getBBox();
      scroller.center(shapeCoordinates.x, shapeCoordinates.y + 200);
      return shape;
    },
    editEntity: (cellView, serviceModel, attributeValues) => {
      //line below resolves issue that appendColumns did update values in the model, but visual representation wasn't updated
      cellView.model.set("items", []);
      appendColumns(
        cellView.model as ServiceEntityBlock,
        serviceModel.attributes.map((attr) => attr.name),
        attributeValues,
        false,
      );
      return cellView.model as ServiceEntityBlock;
    },
    zoom: (delta) => {
      scroller.zoom(0.05 * delta, { min: 0.4, max: 1.2, grid: 0.05 });
    },
    saveCoordinates: (id) => {
      const coordinates = getCellsCoordinates(graph);
      localStorage.setItem(id, JSON.stringify(coordinates));
    },
  };
}

export interface DiagramHandlers {
  removeCanvas: () => void;
  addInstance: (
    instance: InstanceWithReferences,
    services: ServiceModel[],
    isMainInstance: boolean,
  ) => serializedCell[];
  addEntity: (
    entity: InstanceAttributeModel,
    service: ServiceModel,
    addingCoreInstance: boolean,
    isEmbedded: boolean,
    embeddedTo: string,
  ) => ServiceEntityBlock;
  editEntity: (
    cellView: dia.CellView,
    serviceModel: ServiceModel,
    attributeValues: InstanceAttributeModel,
  ) => ServiceEntityBlock;
  zoom: (delta: 1 | -1) => void;
  saveCoordinates: (id: string) => void;
}
