import { dia, shapes } from "@inmanta/rappid";
import { showLinkTools } from "../actions";
import { anchorNamespace } from "../anchors";
import createHalo from "../halo";
import { checkIfConnectionIsAllowed, toggleLooseElement } from "../helpers";
import collapseButton from "../icons/collapse-icon.svg";
import expandButton from "../icons/expand-icon.svg";
import { ActionEnum, ConnectionRules, TypeEnum } from "../interfaces";
import { routerNamespace } from "../routers";
import { Link, ServiceEntityBlock } from "../shapes";

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
  constructor(
    connectionRules: ConnectionRules,
    graph: dia.Graph,
    editable: boolean,
  ) {
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

    this.paper.on(
      "element:showDict",
      (_elementView: dia.ElementView, event: dia.Event) => {
        document.dispatchEvent(
          new CustomEvent("openDictsModal", {
            detail: event.target.parentElement.attributes.dict.value,
          }),
        );
      },
    );

    this.paper.on(
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
        elementAsShape.attr("buttonBody/y", bbox.height - 32);

        elementAsShape.set("isCollapsed", !isCollapsed);
      },
    );

    this.paper.on("cell:pointerup", (cellView) => {
      // We don't want a Halo if cellView is a Link or is a representation of an already existing instance that has strict_modifier set to false
      if (
        cellView.model instanceof dia.Link ||
        cellView.model.get("isBlockedFromEditing") ||
        !editable
      ) {
        return;
      }

      const halo = createHalo(graph, this.paper, cellView, connectionRules);

      halo.render();
    });

    this.paper.on("link:mouseenter", (linkView) => {
      const source = linkView.model.source();
      const target = linkView.model.target();

      if (!source.id || !target.id) {
        return;
      }

      const sourceCell = graph.getCell(source.id) as ServiceEntityBlock;
      const targetCell = graph.getCell(target.id) as ServiceEntityBlock;

      // source or target cell have name starting with "_" means that it shouldn't have label when hovering
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

      if (linkView.model.get("isBlockedFromEditing") || !editable) {
        return;
      }

      showLinkTools(this.paper, graph, linkView, connectionRules);
    });

    this.paper.on("link:mouseleave", (linkView: dia.LinkView) => {
      linkView.removeTools();
      linkView.model.labels([]);
    });

    this.paper.on("link:connect", (linkView: dia.LinkView) => {
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
       * @returns data assigned to ElementCell or null if it's not assigned
       */
      const assignConnectionData = (
        elementCell: ServiceEntityBlock,
        connectingCell: ServiceEntityBlock,
      ) => {
        const cellRelations = elementCell.getRelations();
        const cellName = elementCell.getName();
        const connectingCellName = connectingCell.getName();

        //if cell has Map of relations that mean it can accept inter-service relations
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
              connectingCell.id,
              cellConnectionRule.attributeName,
            );
            document.dispatchEvent(
              new CustomEvent("updateInstancesToSend", {
                detail: { cell: sourceCell, actions: ActionEnum.UPDATE },
              }),
            );
          }
        }

        if (
          elementCell.get("isEmbedded") &&
          elementCell.get("embeddedTo") !== null &&
          elementCell.get("holderName") === connectingCellName
        ) {
          elementCell.set("embeddedTo", connectingCell.id);
          toggleLooseElement(this.paper.findViewByModel(elementCell), "remove");

          document.dispatchEvent(
            new CustomEvent("updateInstancesToSend", {
              detail: { cell: elementCell, actions: ActionEnum.UPDATE },
            }),
          );
        }
      };

      //as the connection between two cells is bidirectional we need attempt to assign data to both cells
      assignConnectionData(sourceCell, targetCell);
      assignConnectionData(targetCell, sourceCell);
    });
  }
}
