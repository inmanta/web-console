import { RefObject } from "react";
import { dia, shapes, ui } from "@inmanta/rappid";
import { InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import {
  updateAttributes,
  appendInstance,
  populateGraphWithDefault,
} from "./actions";
import {
  applyCoordinatesToCells,
  getCellsCoordinates,
  toggleLooseElement,
} from "./helpers";
import {
  ConnectionRules,
  EmbeddedEventEnum,
  SavedCoordinates,
} from "./interfaces";
import { ComposerPaper } from "./paper";
import { ServiceEntityBlock } from "./shapes";

/**
 * Initializes the diagram.
 *
 * This function creates a new JointJS graph and paper, sets up a paper scroller, and attaches event listeners.
 * It also sets up tooltips for elements with the `data-tooltip` attribute.
 *
 * @param {RefObject<HTMLDivElement>} canvasRef - A reference to the HTML div element that will contain the diagram.
 * @param {Function} setScroller - A function to update the state of the scroller.
 * @param {ConnectionRules} connectionRules - The rules for connecting elements in the diagram.
 * @param {boolean} editable - A flag indicating if the diagram is editable.
 * @param {ServiceModel} mainService - The main service model for the diagram.
 *
 * @returns {DiagramHandlers} An object containing handlers for various diagram actions.
 */
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

  //trigger highlighter when user drag element from stencil
  graph.on("add", function (cell) {
    const paperRepresentation = paper.findViewByModel(cell);

    if (
      cell.get("isEmbedded") &&
      !cell.get("embeddedTo") &&
      paperRepresentation
    ) {
      toggleLooseElement(paperRepresentation, EmbeddedEventEnum.ADD);
    }
  });

  //programmatically trigger link:connect event, when we connect elements not by user interaction
  graph.on("link:connect", (link: dia.Link) => {
    const linkView = paper.findViewByModel(link);

    if (linkView) {
      paper.trigger("link:connect", linkView);
    }
  });

  paper.on(
    "blank:pointerdown",
    (evt: dia.Event) => evt && scroller.startPanning(evt),
  );

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
      services: ServiceModel[],
      instance: InstanceWithRelations | null,
    ) => {
      let cells: ServiceEntityBlock[] = [];

      if (!instance) {
        cells = populateGraphWithDefault(graph, mainService);
      } else {
        cells = appendInstance(paper, graph, instance, services);

        if (instance.instance.metadata?.coordinates) {
          const parsedCoordinates = JSON.parse(
            instance.instance.metadata?.coordinates,
          );

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

      return cells;
    },

    editEntity: (cellView, serviceModel, attributeValues) => {
      //line below resolves issue that appendColumns did update values in the model, but visual representation wasn't updated
      cellView.model.set("items", []);
      updateAttributes(
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
  /**
   * Removes the canvas.
   *
   * This function is responsible for cleaning up the canvas when it is no longer needed.
   * removes the scroller and paper elements.
   */
  removeCanvas: () => void;

  /**
   * Adds an instance to the canvas.
   *
   * This function is responsible for adding a fetched instance with all it's relations to the canvas or adds minimal default instance for the main service model.
   * It creates a new elements for the instance, it's embedded entities and related entities, adds them to the graph, and returns the serialized cells of the graph.
   *
   * @param {ServiceModel[]} services - The array of service models to which the instance or it's related instances belongs.
   * @param {InstanceWithRelations} [instance] - The instance to be added to the canvas. If not provided, a default instance of main type will be created.
   *
   * @returns {ServiceEntityBlock[]} The created cells after adding the instance.
   */
  addInstance: (
    services: ServiceModel[],
    instance: InstanceWithRelations | null,
  ) => ServiceEntityBlock[];

  /**
   * Edits an entity in the canvas.
   *
   * This function is responsible for updating an existing entity in the canvas.
   * It modifies the entity's properties based on the provided changes, and returns the serialized cells of the graph.
   *
   * @param {dia.CellView} cellView - The view of the cell to be edited.
   * @param {ServiceModel} serviceModel - the service model of the entity edited.
   * @param {InstanceAttributeModel} attributeValues - An object containing the changes to be applied to the entity.
   *
   * @returns {ServiceEntityBlock} The updated entity block.
   */
  editEntity: (
    cellView: dia.CellView,
    serviceModel: ServiceModel,
    attributeValues: InstanceAttributeModel,
  ) => ServiceEntityBlock;

  /**
   *
   * This function is responsible for finding and returning the position where all elements are placed in the canvas.
   *
   * @returns {SavedCoordinates} The array of coordinates for all elements in the canvas.
   */
  getCoordinates: () => SavedCoordinates[];
}
