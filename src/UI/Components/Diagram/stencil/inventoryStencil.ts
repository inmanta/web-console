import { dia, ui } from "@inmanta/rappid";
import { ServiceModel } from "@/Core";
import { Inventories } from "@/Data/Managers/V2/GETTERS/GetInventoryList";
import { createComposerEntity } from "../actions";
import { createStencilElement } from "./helpers";

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
    serviceModels: ServiceModel[],
  ) {
    const groups = {};

    //Create object with service names as keys and all of the service instances as StencilElements, to be used in the Stencil Sidebar
    Object.keys(serviceInventories).forEach((serviceName) => {
      const serviceModel = serviceModels.find(
        (model) => model.name === serviceName,
      );

      if (!serviceModel) {
        return;
      }

      return (groups[serviceName] = serviceInventories[serviceName].map(
        (instance) => {
          const attributes =
            instance.candidate_attributes ||
            instance.active_attributes ||
            undefined;

          const displayName = instance.service_identity_attribute_value
            ? instance.service_identity_attribute_value
            : instance.id;

          //add the instance id to the attributes object, to then pass it to the actual object on canvas
          return createStencilElement(displayName, serviceModel, {
            ...attributes,
            id: instance.id,
          });
        },
      ));
    });

    this.stencil = new ui.Stencil({
      id: "inventory-stencil",
      testid: "inventory-stencil",
      className: "joint-stencil hidden",
      paper: scroller,
      width: 240,
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
        const entity = createComposerEntity({
          serviceModel: cell.get("serviceModel"),
          isCore: false,
          isInEditMode: false,
          attributes: cell.get("instanceAttributes"),
        });

        //set id to the one that is stored in the stencil which equal to the instance id
        entity.set("id", cell.get("id"));
        entity.set("isBlockedFromEditing", true);
        entity.set("stencilName", cell.get("name"));

        return entity;
      },
      dragEndClone: (el) => el.clone().set("id", el.get("id")),
      layout: {
        columns: 1,
        rowHeight: "compact",
        rowGap: 10,
        marginY: 10,
        horizontalAlign: "left",
        // reset defaults
        resizeToFit: false,
        centre: false,
        dx: 0,
        dy: 10,
        background: "#FFFFFF",
      },
    });

    stencilElement.appendChild(this.stencil.el);
    this.stencil.render();

    this.stencil.load(groups);
    this.stencil.freeze(); //freeze by default as this tab is not active on init

    this.stencil.on("element:drop", (elementView) => {
      const elements = [
        {
          selector: `.body_${elementView.model.get("stencilName")}`,
          className: "stencil_accent-disabled",
        },
        {
          selector: `.bodyTwo_${elementView.model.get("stencilName")}`,
          className: "stencil_body-disabled",
        },
        {
          selector: `.text_${elementView.model.get("stencilName")}`,
          className: "stencil_text-disabled",
        },
      ];

      elements.forEach(({ selector, className }) => {
        const element = document.querySelector(selector);

        if (element) {
          element.classList.add(className);
        }
      });
    });
  }
}