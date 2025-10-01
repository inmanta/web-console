import { dia, g, highlighters, linkTools } from "@inmanta/rappid";
import { t_global_border_radius_small } from "@patternfly/react-tokens";
import {
  ConnectionRules,
  LabelLinkView,
  EventActionEnum,
  ActionEnum,
} from "@/UI/Components/ComposerCanvas/interfaces";
import {
  dispatchLooseElement,
  dispatchUpdateServiceOrderItems,
} from "../Context/dispatchers";
import { ServiceEntityBlock } from "../Shapes";

/**
 * Updates the position of a label relative to a link's target or source side.
 *
 * @param {"target" | "source"} side - The side of the link where the label is positioned. Can be "target" or "source".
 * @param {g.Rect} _refBBox - The bounding box of a reference element (unused).
 * @param {SVGSVGElement} node - The SVG element representing the label.
 * @param {{ [key: string]: unknown }} _attrs - Additional attributes for the label (unused).
 * @param {LabelLinkView} linkView - The view representing the link associated with the label.
 * @returns {{ textAnchor: "start" | "end", x: number, y: number }} - An object containing the updated attributes for the label.
 */
export const updateLabelPosition = (
  side: "target" | "source",
  _refBBox: g.Rect,
  _node: SVGSVGElement,
  _attrs: { [key: string]: unknown },
  linkView: LabelLinkView //dia.LinkView & dia.Link doesn't have sourceView or targetView properties in the model
): { textAnchor: "start" | "end"; x: number; y: number } => {
  let textAnchor, tx, ty, viewCoordinates, anchorCoordinates;

  if (side === "target") {
    viewCoordinates = linkView.targetView.model.position();
    anchorCoordinates = linkView.targetPoint;
  } else {
    viewCoordinates = linkView.sourceView.model.position();
    anchorCoordinates = linkView.sourcePoint;
  }

  if (viewCoordinates && anchorCoordinates) {
    if (viewCoordinates.x !== anchorCoordinates.x) {
      textAnchor = "start";
      tx = 15;
    } else {
      textAnchor = "end";
      tx = -15;
    }
  }

  const isTargetBelow = linkView.getEndAnchor("target").y < linkView.getEndAnchor("source").y;

  switch (side) {
    case "target":
      ty = isTargetBelow ? -15 : 15;
      break;
    case "source":
      ty = isTargetBelow ? 15 : -15;
      break;
  }

  return { textAnchor: textAnchor, x: tx || 0, y: ty || 0 };
};

/**
 * Toggle the highlighting of a loose element in a diagram cell view.
 * @param {dia.CellView} cellView - The cell view containing the element.
 * @param {EventActionEnum} kind - The action to perform, either "add" to add highlighting or "remove" to remove highlighting.
 *
 * @returns {void}
 */
export const toggleLooseElement = (cellView: dia.CellView, kind: EventActionEnum): void => {
  switch (kind) {
    case EventActionEnum.ADD:
      highlighters.mask.add(cellView, "root", "loose_element", {
        padding: 0,
        className: "loose_element-highlight",
        attrs: {
          "stroke-width": 3,
          rx: t_global_border_radius_small.value,
          filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))",
        },
      });
      break;
    case EventActionEnum.REMOVE:
      const highlighter = dia.HighlighterView.get(cellView, "loose_element");

      if (highlighter) {
        highlighter.remove();
      }

      break;
    default:
      break;
  }

  dispatchLooseElement(kind, cellView.model.id);
};

/**
 * Function to display the methods to alter the connection objects - currently, the only function visible is the one removing connections.
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#dia.LinkView
 * https://resources.jointjs.com/docs/jointjs/v3.6/joint.html#linkTools
 *
 * @param {dia.Paper} paper - JointJS paper object
 * @param {dia.Graph} graph JointJS graph object
 * @param {dia.LinkView} linkView  - The view for the joint.dia.Link model.
 * @param {ConnectionRules} connectionRules  - The rules for the connections between entities.
 *
 * @returns {void}
 */
export function showLinkTools(
  paper: dia.Paper,
  graph: dia.Graph,
  linkView: dia.LinkView,
  connectionRules: ConnectionRules
) {
  const source = linkView.model.source();
  const target = linkView.model.target();

  if (!source.id || !target.id) {
    return;
  }

  const sourceCell = graph.getCell(source.id) as ServiceEntityBlock;
  const targetCell = graph.getCell(target.id) as ServiceEntityBlock;

  /**
   * checks if the connection between cells can be deleted thus if we should hide linkTool
   * @param {ServiceEntityBlock} cellOne ServiceEntityBlock
   * @param {ServiceEntityBlock} cellTwo ServiceEntityBlock
   * @returns {boolean}
   */
  const shouldHideLinkTool = (
    cellOne: ServiceEntityBlock,
    cellTwo: ServiceEntityBlock
  ): boolean => {
    const nameOne = cellOne.getName();
    const nameTwo = cellTwo.getName();

    const elementConnectionRule = connectionRules[nameOne].find((rule) => rule.name === nameTwo);

    const isElementInEditMode: boolean | undefined = cellOne.get("isInEditMode");

    if (isElementInEditMode && elementConnectionRule && elementConnectionRule.modifier !== "rw+") {
      return true;
    }

    return false;
  };

  if (shouldHideLinkTool(sourceCell, targetCell) || shouldHideLinkTool(targetCell, sourceCell)) {
    return;
  }

  const tools = new dia.ToolsView({
    tools: [
      new linkTools.Remove({
        distance: "50%",
        markup: [
          {
            tagName: "circle",
            selector: "button",
            attributes: {
              r: 7,
              class: "joint-link_remove-circle",
              "stroke-width": 2,
              cursor: "pointer",
            },
          },
          {
            tagName: "path",
            selector: "icon",
            attributes: {
              d: "M -3 -3 3 3 M -3 3 3 -3",
              class: "joint-link_remove-path",
              "stroke-width": 2,
              "pointer-events": "none",
            },
          },
        ],
        action: (_evt, linkView: dia.LinkView, toolView: dia.ToolView) => {
          const { model } = linkView;
          const source = model.source();
          const target = model.target();

          const sourceCell = graph.getCell(source.id as dia.Cell.ID) as ServiceEntityBlock;
          const targetCell = graph.getCell(target.id as dia.Cell.ID) as ServiceEntityBlock;

          //as the connection between two cells is bidirectional we need attempt to remove data from both cells
          removeConnectionData(paper, graph, sourceCell, targetCell);
          removeConnectionData(paper, graph, targetCell, sourceCell);

          model.remove({ ui: true, tool: toolView.cid });
        },
      }),
    ],
  });

  linkView.addTools(tools);
}

/**
 * Function that remove data about inter-service relation between cells
 * @param {dia.Paper} paper JointJS paper object
 * @param {dia.Graph} graph JointJS graph object
 * @param {ServiceEntityBlock} elementCell cell that we checking
 * @param {ServiceEntityBlock} cellToDisconnect cell that is being connected to elementCell
 * @returns {void}
 */
const removeConnectionData = (
  paper: dia.Paper,
  graph: dia.Graph,
  elementCell: ServiceEntityBlock,
  cellToDisconnect: ServiceEntityBlock
): void => {
  const elementRelations = elementCell.getRelations();

  // resolve any possible relation connections between cells
  if (elementRelations && elementRelations.has(String(cellToDisconnect.id))) {
    elementCell.removeRelation(String(cellToDisconnect.id));

    //get all connected entities to inter-service relation cell (the current relation that will be removed is included here)
    const disconnectedCellNeighbors = graph.getNeighbors(cellToDisconnect);

    //check if the cell that we are connected is also connected to the other cell as embedded Entity
    const embeddedToID = cellToDisconnect.get("embeddedTo");

    //filter out every cell that is either embedded entity to the cellToDisconnect or is core or the cellToDisconnect is embedded to it
    const interServiceRelations = disconnectedCellNeighbors.filter(
      (cell) => !(cell.get("embeddedTo") === cellToDisconnect.id) || !(embeddedToID === cell.id)
    );

    //all cells left are the inter-service relation connections, if there is only one then we should highlight the cell, if more then it's not loose inter-service relation cell, zero shouldn't be possible as we are including current connection in the array
    if (interServiceRelations.length === 1) {
      toggleLooseElement(paper.findViewByModel(cellToDisconnect), EventActionEnum.ADD);
    }

    dispatchUpdateServiceOrderItems(elementCell, ActionEnum.UPDATE);
  }
};

/**
 * Function that checks if the cells are colliding and moves them if they are
 *
 * @param {dia.Graph} graph - The jointJS graph to which entities are be added.
 * @param {dia.Cell[]} cells - the array of cells to check for collisions
 */
export const moveCellsFromColliding = (graph: dia.Graph, cells: dia.Cell[]) => {
  cells.map((cell) => {
    let isColliding = false;

    do {
      const overlappingCells = graph
        .findModelsInArea(cell.getBBox())
        .filter((el) => el.id !== cell.id);

      if (overlappingCells.length > 0) {
        isColliding = true;
        // an overlap found, change the position
        const coordinates = cell.position();

        cell.set("position", {
          x: coordinates.x,
          y: coordinates.y + 50,
        });
      } else {
        isColliding = false;
      }
    } while (isColliding);
  });
};
