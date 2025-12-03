import { dia, shapes } from "@inmanta/rappid";
import {
  dispatchSendCellToSidebar,
  dispatchUpdateServiceOrderItems,
} from "../Context/dispatchers";
import { checkIfConnectionIsAllowed, showLinkTools, toggleLooseElement } from "../Helpers";
import { Link, ServiceEntityBlock } from "../Shapes";
import { anchorNamespace } from "../anchors";
import createHalo from "../halo";
import { ActionEnum, ConnectionRules, EventActionEnum, TypeEnum } from "../interfaces";
import { routerNamespace } from "../routers";

/**
 * Represents the ComposerPaper class. which initializes the JointJS paper object and sets up the event listeners.
 *
 * more info: https://docs.jointjs.com/api/dia/Paper/
 */
export class ComposerPaper {
  paper: dia.Paper;

  /**
   * Creates an instance of ComposerPaper.
   * @param {ConnectionRules} connectionRules - The connection rules.
   * @param {dia.Graph} graph - The JointJS graph.
   * @param {boolean} editable - Indicates if the paper is editable.
   */
  constructor(connectionRules: ConnectionRules, graph: dia.Graph, editable: boolean) {
    this.paper = new dia.Paper({
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
      validateConnection: (sourceView, srcMagnet, targetView, tgtMagnet) => {
        const baseValidators = srcMagnet !== tgtMagnet && sourceView.cid !== targetView.cid;

        const sourceViewAsElement = graph
          .getElements()
          .find((element) => element.cid === sourceView.model.cid);

        //find sourceView as Element to get Neighbors and check if it's already connected to the target
        if (sourceViewAsElement) {
          const connectedElements = graph.getNeighbors(sourceViewAsElement);
          const isConnected = connectedElements.find(
            (connectedElement) => connectedElement.cid === targetView.model.cid
          );
          const isAllowed = checkIfConnectionIsAllowed(
            graph,
            targetView,
            sourceView,
            connectionRules
          );

          return isConnected === undefined && isAllowed && baseValidators;
        }

        return baseValidators;
      },
    });

    //Event that is triggered when user clicks on the blank space of the paper. It's used to clear the sidebar.
    this.paper.on("blank:pointerdown", () => {
      dispatchSendCellToSidebar(null);
    });

    //Event that is triggered when user clicks on the cell. It's used to send the cell data to the sidebar and create a Halo around the cell. with option to link it to another cell
    this.paper.on("cell:pointerup", (cellView: dia.CellView) => {
      //We don't want interaction at all if cellView is a Link
      if (cellView.model instanceof dia.Link) {
        return;
      }

      dispatchSendCellToSidebar(cellView);

      const halo = createHalo(graph, this.paper, cellView, connectionRules);

      halo.render();
    });

    //Event that is triggered when user clicks on the link. It's used to show the link tools and the link labels for connected cells
    this.paper.on("link:mouseenter", (linkView: dia.LinkView) => {
      const { model } = linkView;
      const source = model.source();
      const target = model.target();

      if (!source.id || !target.id) {
        return;
      }

      const sourceCell = graph.getCell(source.id) as ServiceEntityBlock;
      const targetCell = graph.getCell(target.id) as ServiceEntityBlock;

      // source or target cell have name starting with "_" means that it shouldn't have label when hovering
      if (!(sourceCell.getName()[0] === "_")) {
        model.appendLabel({
          attrs: {
            rect: {
              fill: "none",
            },
            text: {
              text: sourceCell.getName(),
              "auto-orient": "target",
              class: "joint-label-text",
            },
          },
          position: {
            distance: 1,
          },
        });
      }

      if (!(targetCell.getName()[0] === "_")) {
        model.appendLabel({
          attrs: {
            rect: {
              fill: "none",
            },
            text: {
              text: targetCell.getName(),
              "auto-orient": "source",
              class: "joint-label-text",
            },
          },
          position: {
            distance: 0,
          },
        });
      }

      if (
        model.get("isBlockedFromEditing") ||
        !editable ||
        !model.get("isRelationshipConnection")
      ) {
        return;
      }

      showLinkTools(this.paper, graph, linkView, connectionRules);
    });

    //Event that is triggered when user leaves the link. It's used to remove the link tools and the link labels for connected cells
    this.paper.on("link:mouseleave", (linkView: dia.LinkView) => {
      linkView.removeTools();
      linkView.model.labels([]);
    });

    //Event that is triggered when user drags the link from one cell to another. It's used to update the connection between the cells
    this.paper.on("link:connect", (linkView: dia.LinkView) => {
      const { model } = linkView;
      //only id values are stored in the linkView
      const source = model.source();
      const target = model.target();

      if (!source.id || !target.id) {
        return;
      }

      const sourceCell = graph.getCell(source.id) as ServiceEntityBlock;
      const targetCell = graph.getCell(target.id) as ServiceEntityBlock;

      /**
       * Function that checks if cell that we are connecting  to is being the one storing information about said connection.
       * @param elementCell cell that we checking
       * @param connectingCell cell that is being connected to elementCell
       * @returns data assigned to ElementCell or null if it's not assigned
       */
      const assignConnectionData = (
        elementCell: ServiceEntityBlock,
        connectingCell: ServiceEntityBlock
      ) => {
        const cellRelations = elementCell.getRelations();
        const cellName = elementCell.getName();
        const connectingCellName = connectingCell.getName();

        //if cell has Map of relations that mean it can accept inter-service relations
        if (cellRelations) {
          const cellConnectionRule = connectionRules[cellName].find(
            (rule) => rule.name === connectingCellName
          );

          //if there is corresponding rule we can apply connection and update given service
          if (cellConnectionRule && cellConnectionRule.kind === TypeEnum.INTERSERVICE) {
            elementCell.addRelation(connectingCell.id, cellConnectionRule.attributeName);
            model.set("isRelationshipConnection", true);

            dispatchUpdateServiceOrderItems(targetCell, ActionEnum.UPDATE);

            toggleLooseElement(this.paper.findViewByModel(connectingCell), EventActionEnum.REMOVE);
          }
        }

        if (
          elementCell.get("isEmbeddedEntity") &&
          elementCell.get("embeddedTo") !== null &&
          elementCell.get("holderName") === connectingCellName
        ) {
          elementCell.set("embeddedTo", connectingCell.id);
          toggleLooseElement(this.paper.findViewByModel(elementCell), EventActionEnum.REMOVE);

          dispatchUpdateServiceOrderItems(elementCell, ActionEnum.UPDATE);
        }
      };

      //as the connection between two cells is bidirectional we need attempt to assign data to both cells
      assignConnectionData(sourceCell, targetCell);
      assignConnectionData(targetCell, sourceCell);
    });
  }
}
