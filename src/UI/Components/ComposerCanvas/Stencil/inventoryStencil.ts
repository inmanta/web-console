import { dia, ui } from "@inmanta/rappid";
import { t_global_background_color_primary_default } from "@patternfly/react-tokens";
import { ServiceModel } from "@/Core";
import { Inventories } from "@/Data/Queries";
import { ServiceEntityBlock } from "../Shapes";
import { toggleDisabledStencil, createStencilElement } from "./helpers";

const GRID_SIZE = 8;
const PADDING_S = GRID_SIZE;

/**
 * Class initializing the Service Inventory Stencil Tab.
 * This stencil tab is used to drag and drop the inter-service related instances onto the diagram.
 */
export class InventoryStencilTab {
  stencil: ui.Stencil;

  /**
   * Creates the Service Inventory Stencil Tab.
   *
   * @param {HTMLElement} stencilElement - The HTML element to which the stencil will be appended.
   * @param {ui.PaperScroller} scroller - The jointJS scroller associated with the stencil.
   * @param {Inventories} serviceInventories - The service inventories used to populate the stencil with corresponding Elements.
   */
  constructor(
    stencilElement: HTMLElement,
    scroller: ui.PaperScroller,
    serviceInventories: Inventories,
    serviceModels: ServiceModel[]
  ) {
    const groups = {};

    // Create object with service names as keys and all of the service instances as StencilElements, to be used in the Stencil Sidebar
    Object.keys(serviceInventories).forEach((serviceName) => {
      const serviceModel = serviceModels.find((model) => model.name === serviceName);

      if (!serviceModel) {
        return;
      }

      return (groups[serviceName] = serviceInventories[serviceName].map((instance, index) => {
        const attributes = instance.candidate_attributes || instance.active_attributes || undefined;

        const displayName = instance.service_identity_attribute_value
          ? instance.service_identity_attribute_value
          : instance.id;

        //add the instance id to the attributes object, to then pass it to the actual object on canvas
        return createStencilElement({
          name: displayName,
          serviceModel: serviceModel,
          instanceAttributes: {
            ...attributes,
            id: instance.id,
          },
          isEmbeddedEntity: false,
          showBorderTop: index === 0,
          isDisabled: false,
        });
      }));
    });

    this.stencil = new ui.Stencil({
      id: "inventory-stencil",
      testid: "inventory-stencil",
      className: "joint-stencil hidden",
      paper: scroller,
      width: 240,
      height: 400,
      scaleClones: true,
      dropAnimation: true,
      marginTop: PADDING_S,
      paperPadding: PADDING_S,
      marginLeft: PADDING_S,
      marginRight: PADDING_S,
      paperOptions: {
        sorting: dia.Paper.sorting.NONE,
      },
      groups,
      search: {
        "*": ["attrs/label/text"],
        "standard.Image": ["description"],
        "standard.Path": ["description"],
      },
      dragStartClone: (cell: dia.Cell) => {
        const entity = new ServiceEntityBlock({
          serviceModel: cell.get("serviceModel"),
          isCore: false,
          isInEditMode: false,
          attributes: cell.get("instanceAttributes"),
          isFromInventoryStencil: true,
          isBlockedFromEditing: true,
          stencilName: cell.get("name"),
          id: cell.get("id"),
        });

        return entity;
      },
      dragEndClone: (el) => {
        // cloned element loses key value pairs, so we need to set them again
        const cloned = el.clone();
        cloned.set("id", el.get("id"));
        cloned.set("items", el.get("items"));
        cloned.set("instanceAttributes", el.get("instanceAttributes"));
        cloned.set("sanitizedAttrs", el.get("sanitizedAttrs"));
        cloned.set("isFromInventoryStencil", el.get("isFromInventoryStencil"));
        cloned.set("isBlockedFromEditing", el.get("isBlockedFromEditing"));
        cloned.set("stencilName", el.get("stencilName"));
        return cloned;
      },
      layout: {
        columns: 1,
        rowHeight: "compact",
        marginY: 10,
        horizontalAlign: "left",
        // reset defaults
        resizeToFit: false,
        centre: false,
        dx: 0,
        dy: 10,
        background: t_global_background_color_primary_default.var,
      },
    });

    stencilElement.appendChild(this.stencil.el);
    this.stencil.el.querySelector(".search")?.classList.add("pf-v6-c-text-input-group__text-input");

    this.stencil.render();

    this.stencil.load(groups);
    this.stencil.freeze(); //freeze by default as this tab is not active on init

    this.stencil.on("element:drop", (elementView) => {
      const stencilName = elementView.model.get("stencilName");

      if (stencilName) {
        toggleDisabledStencil(stencilName, true);
      }
    });
  }
}
