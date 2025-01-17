import { RefObject } from "react";
import { dia, shapes, ui } from "@inmanta/rappid";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { InstanceWithRelations } from "@/Data/Managers/V2/GETTERS/GetInstanceWithRelations";
import { dispatchUpdateStencil } from "./Context/dispatchers";
import { populateGraphWithDefault } from "./actions/createMode";
import { appendInstance } from "./actions/editMode";
import { updateAttributes } from "./actions/general";
import {
  applyCoordinatesToCells,
  getCellsCoordinates,
  getKeyAttributesNames,
} from "./helpers";
import { toggleLooseElement } from "./helpers";
import {
  ConnectionRules,
  EventActionEnum,
  SavedCoordinates,
} from "./interfaces";
import { ComposerPaper } from "./paper";
import { ServiceEntityBlock } from "./shapes";
import { toggleDisabledStencil } from "./stencil/helpers";

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
    //if it's a link, we don't want to assert any highlighting, if the canvas is not editable then there shouldn't be any highlighting in the first place as there are no loose elements by default and no way to add them
    if (cell.get("type") === "Link" || !editable) {
      return;
    }

    const paperRepresentation = paper.findViewByModel(cell);

    if (!cell.get("isCore") && paperRepresentation) {
      toggleLooseElement(paperRepresentation, EventActionEnum.ADD);
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
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    loadState: (graphJSON: any) => {
      graph.fromJSON(graphJSON);
      graph.getCells().forEach((cell) => {
        if (cell.get("type") !== "Link") {
          const copy = graphJSON.cells.find((c) => c.id === cell.id);
          const stencilName = cell.get("stencilName");

          if (cell.get("isEmbeddedEntity")) {
            dispatchUpdateStencil(cell.get("entityName"));
          }

          if (stencilName) {
            toggleDisabledStencil(stencilName, true);
          }
          cell.set("items", copy.items); // converted cells lacks "items" attribute
        }
      });
    },

    saveAndClearCanvas: () => {
      const copy = graph.toJSON();

      graph.getCells().forEach((cell) => cell.remove());

      return copy;
    },

    addInstance: (
      services: ServiceModel[],
      instance: InstanceWithRelations | null,
    ) => {
      let cells: ServiceEntityBlock[] = [];

      if (!instance) {
        populateGraphWithDefault(graph, mainService);

        cells = graph
          .getCells()
          .filter(
            (cell) => cell.get("type") !== "Link",
          ) as ServiceEntityBlock[];
      } else {
        cells = appendInstance(paper, graph, instance, services);

        if (
          instance.instance.metadata &&
          instance.instance.metadata.coordinates
        ) {
          const parsedCoordinates = JSON.parse(
            instance.instance.metadata.coordinates,
          );

          if (parsedCoordinates.version === "v2") {
            applyCoordinatesToCells(graph, parsedCoordinates.data);
          }
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
      const keyAttributes = getKeyAttributesNames(serviceModel);

      //line below resolves issue that appendColumns did update values in the model, but visual representation wasn't updated
      cellView.model.set("items", []);
      updateAttributes(
        cellView.model as ServiceEntityBlock,
        keyAttributes,
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
   * Saves the canvas state to JSON format and then clear the canvas.
   *
   * This function is responsible for cleaning up the canvas, and it's used when stencil/sidebar is updated to keep them aligned with each other
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  saveAndClearCanvas: () => any; //graph.toJSON() return object of Any type, the type is different from dia.Graph so I couldn't use it there and left as explicit any

  /**
   * it loads the state of the canvas from the provided JSON object.
   *
   * @param {any} graphJSON - The JSON object representing the state of the canvas. graph.toJSON() return object of Any type, the type is different from dia.Graph so I couldn't use it there and left as explicit any
   * @returns {void}
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  loadState: (graphJSON: any) => void;

  /**
   * Adds an instance to the canvas.
   *
   * This function is responsible for adding a fetched instance with all it's relations to the canvas or adds minimal default instance for the main service model.
   * It creates a new elements for the instance, it's embedded entities and inter-service related entities, adds them to the graph, and returns the serialized cells of the graph.
   *
   * @param {ServiceModel[]} services - The array of service models to which the instance or it's  ineter-service related instances belongs.
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
    serviceModel: ServiceModel | EmbeddedEntity,
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
