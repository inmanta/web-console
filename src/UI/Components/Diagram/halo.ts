import { dia, highlighters, ui } from "@inmanta/rappid";
import { t_global_border_radius_small } from "@patternfly/react-tokens";
import {
  dispatchRemoveInterServiceRelationFromTracker,
  dispatchUpdateInterServiceRelations,
  dispatchUpdateServiceOrderItems,
} from "./Context/dispatchers";
import { checkIfConnectionIsAllowed } from "./helpers";
import { toggleLooseElement } from "./helpers";
import { ActionEnum, ConnectionRules, EventActionEnum } from "./interfaces";
import { ServiceEntityBlock } from "./shapes";

/**
 * Creates a halo around a cell view in a graph.
 *
 * it removes all default handles and adds custom event listeners when the link is being triggered from the button and when it's being dropped, both on other cell and on the empty space, and delete the cell. that is being triggered from the form sidebar
 *
 * @param graph - The graph containing the cell view.
 * @param paper - The paper to draw on.
 * @param cellView - The cell view to create a halo around.
 * @param connectionRules - The rules for connecting cells.
 * @returns The created halo.
 */
const createHalo = (
  graph: dia.Graph,
  paper: dia.Paper,
  cellView: dia.CellView,
  connectionRules: ConnectionRules,
) => {
  const halo = new ui.Halo({
    cellView: cellView,
    type: "toolbar",
    rx: t_global_border_radius_small.value,
  });

  halo.removeHandle("clone");
  halo.removeHandle("resize");
  halo.removeHandle("rotate");
  halo.removeHandle("fork");
  halo.removeHandle("unlink");
  halo.removeHandle("remove");

  // this change is purely to keep order of the halo buttons
  halo.changeHandle("link", {
    name: "link",
  });

  halo.listenTo(cellView, "action:delete", function () {
    //cellView.model has the same structure as dia.Element needed as parameter to .getNeighbors() yet typescript complains
    const connectedElements = graph.getNeighbors(cellView.model as dia.Element);

    toggleLooseElement(cellView, EventActionEnum.REMOVE);

    connectedElements.forEach((element) => {
      const elementAsService = element as ServiceEntityBlock;
      const isEmbeddedEntity = element.get("isEmbeddedEntity");
      const isEmbeddedToThisCell =
        element.get("embeddedTo") === cellView.model.id;

      let didElementChange = false;

      //if one of those were embedded into other then update connectedElement as it's got indirectly edited
      if (isEmbeddedEntity && isEmbeddedToThisCell) {
        element.set("embeddedTo", undefined);
        toggleLooseElement(paper.findViewByModel(element), EventActionEnum.ADD);
        didElementChange = true;
      }
      if (element.id === cellView.model.get("embeddedTo")) {
        didElementChange = true;
      }

      const relations = elementAsService.getRelations();

      if (relations) {
        const wasThereRelationToRemove = elementAsService.removeRelation(
          cellView.model.id as string,
        );

        if (wasThereRelationToRemove) {
          dispatchUpdateInterServiceRelations(
            EventActionEnum.REMOVE,
            cellView.model.get("entityName"),
            elementAsService.id,
          );
        }
        didElementChange = didElementChange || wasThereRelationToRemove;
      }

      if (didElementChange) {
        dispatchUpdateServiceOrderItems(elementAsService, ActionEnum.UPDATE);
      }
    });
    dispatchUpdateServiceOrderItems(cellView.model, ActionEnum.DELETE);

    if (cellView.model.get("relatedTo")) {
      dispatchRemoveInterServiceRelationFromTracker(cellView.model.id);
    }

    graph.removeLinks(cellView.model);
    cellView.remove();
    halo.remove();
    graph.removeCells([cellView.model]);
    //trigger click on blank canvas to clear right sidebar
    paper.trigger("blank:pointerdown");
  });

  halo.on("action:link:pointerdown", function () {
    const area = paper.getArea();
    const elements = paper
      .findViewsInArea(area)
      .filter((shape) => shape.cid !== cellView.cid);

    //cellView.model has the same structure as dia.Element needed as parameter to .getNeighbors() yet typescript complains
    const connectedElements = graph.getNeighbors(cellView.model as dia.Element);

    elements.forEach((element) => {
      element.getBBox();
      const isAllowed = checkIfConnectionIsAllowed(
        graph,
        cellView,
        element,
        connectionRules,
      );

      if (!isAllowed) {
        return;
      }
      //if shape isn't found then it means it's not connected, so available to highlight
      const unconnectedShape = connectedElements.find((connectedElement) => {
        return connectedElement.cid === element.model.cid;
      });

      if (unconnectedShape === undefined) {
        highlighters.mask.add(element, "body", "available-to-connect", {
          padding: 0,
          className: "halo-highlight",
          attrs: {
            "stroke-opacity": 0.5,
            "stroke-width": 5,
            rx: t_global_border_radius_small.var,
            filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))",
          },
        });
        const looseElementHighlight = dia.HighlighterView.get(
          element,
          "loose_element",
        );

        if (looseElementHighlight) {
          looseElementHighlight.el.classList.add("-hidden");
        }
      }
    });
  });

  //this event is fired even if we hang connection outside other shape
  halo.on("action:link:add", function () {
    const area = paper.getArea();
    const shapes = paper.findViewsInArea(area);

    shapes.map((shape) => {
      const highlighter = dia.HighlighterView.get(
        shape,
        "available-to-connect",
      );

      if (highlighter) {
        highlighter.remove();
      }
      const looseElementHighlight = dia.HighlighterView.get(
        shape,
        "loose_element",
      );

      if (looseElementHighlight) {
        looseElementHighlight.el.classList.remove("-hidden");
      }
    });
  });

  return halo;
};

export default createHalo;
