import { dia, ui } from "@inmanta/rappid";
import { t_global_background_color_primary_default } from "@patternfly/react-tokens";
import { ServiceModel } from "@/Core";
import { CreateModifierHandler, FieldCreator, createFormState } from "../../ServiceInstanceForm";
import { dispatchUpdateServiceOrderItems, dispatchUpdateStencil } from "../Context/dispatchers";
import { AddInterServiceRelationsToTracker, createComposerEntity } from "../actions/general";
import { ActionEnum, EventActionEnum } from "../interfaces";
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
  constructor(stencilElement: HTMLElement, scroller: ui.PaperScroller, service: ServiceModel) {
    this.stencil = new ui.Stencil({
      id: "instance-stencil",
      paper: scroller,
      width: 240,
      height: 400,
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
          isEmbeddedEntity: true,
          holderName: cell.get("holderName"),
          isFromInventoryStencil: false,
        });
      },
      dragEndClone: (el) => el.clone().set("items", el.get("items")).set("id", el.get("id")), //cloned element loses key value pairs, so we need to set them again
      layout: {
        columns: 1,
        rowHeight: "compact",
        horizontalAlign: "left",
        marginY: 10,
        // reset defaults
        resizeToFit: false,
        centre: false,
        dx: 0,
        dy: 0,
        background: t_global_background_color_primary_default.var,
      },
    });
    stencilElement.appendChild(this.stencil.el);
    this.stencil.render();
    this.stencil.load(transformEmbeddedToStencilElements(service));

    this.stencil.on("element:drop", (elementView) => {
      if (elementView.model.get("isEmbeddedEntity")) {
        dispatchUpdateStencil(elementView.model.get("name"), EventActionEnum.ADD);
      }

      // Add inter-service relations to tracker only on valid drop, it means that the element will be successfully created on the diagram
      const serviceModel = elementView.model.get("serviceModel");
      if (serviceModel && serviceModel.inter_service_relations.length > 0) {
        AddInterServiceRelationsToTracker(elementView.model, serviceModel);
      }

      dispatchUpdateServiceOrderItems(elementView.model, ActionEnum.CREATE);
    });
  }
}
