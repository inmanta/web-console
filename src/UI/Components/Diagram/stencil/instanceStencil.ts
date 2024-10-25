import { dia, ui } from "@inmanta/rappid";
import { ServiceModel } from "@/Core";
import {
  CreateModifierHandler,
  FieldCreator,
  createFormState,
} from "../../ServiceInstanceForm";
import { createComposerEntity } from "../actions";
import { ActionEnum, EmbeddedEventEnum } from "../interfaces";
import { transformEmbeddedToStencilElements } from "./helpers";

/**
 * Class initializing the Service Instance Stencil Tab.
 * This stencil tab is used to drag and drop the embedded entity elements onto the diagram.
 */
export class InstanceStencilTab {
  stencil: ui.Stencil;

  /**
   * Creates the Service Instance Stencil Tab.
   *
   * @param {HTMLElement} stencilElement - The HTML element to which the stencil will be appended.
   * @param {ui.PaperScroller} scroller - The jointJS scroller associated with the stencil.
   * @param {ServiceModel} service - The service model used to populate the stencil with corresponding Elements.
   */
  constructor(
    stencilElement: HTMLElement,
    scroller: ui.PaperScroller,
    service: ServiceModel,
  ) {
    this.stencil = new ui.Stencil({
      id: "instance-stencil",
      paper: scroller,
      width: 240,
      scaleClones: true,
      dropAnimation: true,
      paperOptions: {
        sorting: dia.Paper.sorting.NONE,
      },
      canDrag: (cellView) => {
        return !cellView.model.get("disabled");
      },
      dragStartClone: (cell: dia.Cell) => {
        const serviceModel = cell.get("serviceModel");

        const fieldCreator = new FieldCreator(new CreateModifierHandler());
        const fields = fieldCreator.attributesToFields(serviceModel.attributes);

        return createComposerEntity({
          serviceModel,
          isCore: false,
          isInEditMode: false,
          attributes: createFormState(fields),
          isEmbedded: true,
          holderName: cell.get("holderName"),
        });
      },
      dragEndClone: (el) => el.clone().set("items", el.get("items")), //cloned element loses key value pairs, so we need to set them again
      layout: {
        columns: 1,
        rowHeight: "compact",
        rowGap: 10,
        horizontalAlign: "left",
        marginY: 10,
        // reset defaults
        resizeToFit: false,
        centre: false,
        dx: 0,
        dy: 0,
        background: "#FFFFFF",
      },
    });
    stencilElement.appendChild(this.stencil.el);
    this.stencil.render();
    this.stencil.load(transformEmbeddedToStencilElements(service));

    this.stencil.on("element:drop", (elementView) => {
      if (elementView.model.get("isEmbedded")) {
        document.dispatchEvent(
          new CustomEvent("updateStencil", {
            detail: {
              name: elementView.model.get("entityName"),
              action: EmbeddedEventEnum.ADD,
            },
          }),
        );
      }

      document.dispatchEvent(
        new CustomEvent("updateServiceOrderItems", {
          detail: { cell: elementView.model, action: ActionEnum.CREATE },
        }),
      );
    });
  }
}
