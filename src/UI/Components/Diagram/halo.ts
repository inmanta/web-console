import { dia, highlighters, ui } from "@inmanta/rappid";
import { checkIfConnectionIsAllowed } from "./helpers";
import { ConnectionRules } from "./interfaces";
import { ServiceEntityBlock } from "./shapes";

const createHalo = (
  graph: dia.Graph,
  paper: dia.Paper,
  cellView: dia.CellView,
  connectionRules: ConnectionRules,
  updateInstancesToSend: (
    cell: ServiceEntityBlock,
    action: "update" | "create" | "delete",
  ) => void,
) => {
  const halo = new ui.Halo({
    cellView: cellView,
    type: "toolbar",
  });

  halo.removeHandle("clone");
  halo.removeHandle("resize");
  halo.removeHandle("rotate");
  halo.removeHandle("fork");
  halo.removeHandle("unlink");
  halo.removeHandle("remove");

  halo.addHandle({
    name: "delete",
  });
  // this change is purely to keep order of the halo buttons
  halo.changeHandle("link", {
    name: "link",
  });
  halo.addHandle({
    name: "edit",
  });

  // additional listeners to add logic for appended tools, if there will be need for any validation on remove then I think we will need custom handle anyway
  halo.on("action:delete:pointerdown", function () {
    //cellView.model has the same structure as dia.Element needed as parameter to .getNeighbors() yet typescript complains
    const connectedElements = graph.getNeighbors(cellView.model as dia.Element);

    connectedElements.forEach((element) => {
      const elementAsService = element as ServiceEntityBlock;
      const isEmbedded = element.get("isEmbedded");
      const isEmbeddedToTHisCell =
        element.get("embeddedTo") === cellView.model.id;

      let didElementChange = false;

      if (isEmbedded && isEmbeddedToTHisCell) {
        element.set("embeddedTo", null);
        didElementChange = true;
      }
      const relations = elementAsService.getRelations();

      if (relations) {
        didElementChange =
          didElementChange === true ||
          elementAsService.removeRelation(cellView.model.id as string);
      }

      if (didElementChange) {
        updateInstancesToSend(elementAsService, "update");
      }
    });

    updateInstancesToSend(cellView.model as ServiceEntityBlock, "delete");
    graph.removeLinks(cellView.model);
    cellView.remove();
    halo.remove();
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
          attrs: {
            stroke: "#00FF19",
            "stroke-opacity": 0.3,
            "stroke-width": 5,
            filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))",
          },
        });
      }
    });
  });

  //this event is fired even if we hang connection outside other shape
  halo.on("action:link:add", function () {
    const area = paper.getArea();
    const shapes = paper.findViewsInArea(area);

    shapes.map((shape) => {
      highlighters.mask.remove(shape), "available-to-connect";
    });
  });

  halo.on("action:edit:pointerdown", function (event) {
    event.stopPropagation();
    document.dispatchEvent(
      new CustomEvent("openEditModal", {
        detail: cellView,
      }),
    );
  });

  return halo;
};
export default createHalo;