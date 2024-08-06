import { RefObject } from "react";
import { dia, shapes, ui } from "@inmanta/rappid";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import { appendColumns, appendInstance, populateGraph } from "./actions";
import { applyCoordinatesToCells, getCellsCoordinates } from "./helpers";
import {
  ConnectionRules,
  SavedCoordinates,
  serializedCell,
} from "./interfaces";
import { ComposerPaper } from "./paper/paper";
import { ServiceEntityBlock } from "./shapes";

export function diagramInit(
  canvasRef: RefObject<HTMLDivElement>,
  setScroller,
  connectionRules: ConnectionRules,
  editable: boolean,
  mainService: ServiceModel,
): DiagramHandlers {
  /**
   * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.Graph
   */
  const graph = new dia.Graph({}, { cellNamespace: shapes });
  /**
   * https://resources.jointjs.com/docs/rappid/v3.6/ui.PaperScroller.html
   */
  const paper = new ComposerPaper(connectionRules, graph, editable).paper;

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
  setScroller(scroller);

  paper.on("blank:pointerdown", (evt: dia.Event) => scroller.startPanning(evt));

  if (canvasRef.current) {
    canvasRef.current.appendChild(scroller.el);
  }
  scroller.render().center();
  scroller.centerContent();

  new ui.Tooltip({
    rootTarget: ".canvas",
    target: "[data-tooltip]",
    padding: 20,
  });

  paper.unfreeze();
  return {
    removeCanvas: () => {
      scroller.remove();
      paper.remove();
    },

    addInstance: (
      isMainInstance: boolean = true,
      services: ServiceModel[],
      instance?: InstanceWithRelations,
    ) => {
      if (!instance) {
        populateGraph(graph, mainService);
      } else {
        appendInstance(paper, graph, instance, services, isMainInstance);

        if (instance.coordinates) {
          const parsedCoordinates = JSON.parse(instance.coordinates);
          applyCoordinatesToCells(graph, parsedCoordinates);
        }
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

    editEntity: (cellView, serviceModel, attributeValues) => {
      //line below resolves issue that appendColumns did update values in the model, but visual representation wasn't updated
      cellView.model.set("items", []);
      appendColumns(
        cellView.model as ServiceEntityBlock,
        serviceModel.key_attributes || [],
        attributeValues,
        false,
      );
      return cellView.model as ServiceEntityBlock;
    },
    getCoordinates: () => getCellsCoordinates(graph),
  };
}

export interface DiagramHandlers {
  removeCanvas: () => void;
  addInstance: (
    isMainInstance: boolean,
    services: ServiceModel[],
    instance?: InstanceWithRelations,
  ) => serializedCell[];
  editEntity: (
    cellView: dia.CellView,
    serviceModel: ServiceModel,
    attributeValues: InstanceAttributeModel,
  ) => ServiceEntityBlock;
  getCoordinates: () => SavedCoordinates[];
}
