import { dia, ui } from "@inmanta/rappid";
import { ServiceModel } from "@/Core";
import { Inventories } from "@/Data/Managers/V2/GetRelatedInventories";
import {
  CreateModifierHandler,
  FieldCreator,
  createFormState,
} from "../../ServiceInstanceForm";
import { createEntity } from "../actions";
import { EmbeddedEventEnum } from "../interfaces";
import {
  createStencilElement,
  transformEmbeddedToStencilElements,
} from "./helpers";

const GRID_SIZE = 8;
const PADDING_S = GRID_SIZE;

/**
 * Class initializing the Service Instance Stencil Tab.
 */
class InstanceStencilTab {
  stencil: ui.Stencil;

  /**
   * Creates an instance service stencil Tab.
   *
   * @param {HTMLElement} stencilElement - The HTML element to which the stencil will be appended.
   * @param {ui.PaperScroller} scroller - The jointJS scroller associated with the stencil.
   * @param {ServiceModel} service - The service model used to populate the stencil with adequate Elements.
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
        const isCore = false;
        const isInEditMode = false;
        const isEmbedded = true;

        const fieldCreator = new FieldCreator(new CreateModifierHandler());
        const fields = fieldCreator.attributesToFields(serviceModel.attributes);
        const attrs = createFormState(fields);

        return createEntity(
          serviceModel,
          isCore,
          attrs,
          isInEditMode,
          isEmbedded,
          cell.get("holderName"),
        );
      },
      dragEndClone: (el) => {
        if (el.get("isEmbedded")) {
          document.dispatchEvent(
            new CustomEvent("updateStencil", {
              detail: {
                name: el.get("entityName"),
                action: EmbeddedEventEnum.ADD,
              },
            }),
          );
        }

        return el.clone();
      },
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
  }
}

/**
 * Class initializing the Service Inventory Stencil Tab.
 */
class InventoryStencilTab {
  stencil: ui.Stencil;

  /**
   * Creates an inventory stencil tab.
   *
   * @param {HTMLElement} stencilElement - The HTML element to which the stencil will be appended.
   * @param {ui.PaperScroller} scroller - The jointJS scroller associated with the stencil.
   * @param {Inventories} serviceInventories - The service inventories used to populate the stencil with adequate Elements.
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
        const isCore = false;
        const isInEditMode = false;

        const entity = createEntity(
          cell.get("serviceModel"),
          isCore,
          cell.get("instanceAttributes"),
          isInEditMode,
        );

        //set id to the one that is stored in the stencil which equal to the instance id
        entity.set("id", cell.get("id"));
        entity.set("isBlockedFromEditing", true);
        entity.set("stencilName", cell.get("name"));

        return entity;
      },
      dragEndClone: (el) => {
        document
          .querySelector(`.${el.get("stencilName")}_body`)
          ?.classList.add("stencil_accent-disabled");
        document
          .querySelector(`.${el.get("stencilName")}_bodyTwo`)
          ?.classList.add("stencil_body-disabled");
        document
          .querySelector(`.${el.get("stencilName")}_text`)
          ?.classList.add("stencil_text-disabled");

        //set id to the one that has been stored in the stencil which equalt to the instance id
        return el.clone().set("id", el.get("id"));
      },
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
  }
}

/**
 * Class representing a stencil sidebar.
 */
export class StencilSidebar {
  instanceTab: InstanceStencilTab;
  inventoryTab: InventoryStencilTab;
  tabsToolbar: ui.Toolbar;

  /**
   * Creates a stencil sidebar.
   *
   * @param {HTMLElement} stencilElement - The HTML element to which the sidebar elements will be appended.
   * @param {ui.PaperScroller} scroller - The JointJS scroller associated with the stencil.
   * @param {Inventories} serviceInventories - The service inventories used to create the inventory stencil tab.
   * @param {ServiceModel} service - The service model used to create the instance stencil tab.
   */
  constructor(
    stencilElement: HTMLElement,
    scroller: ui.PaperScroller,
    serviceInventories: Inventories,
    service: ServiceModel,
    serviceModels: ServiceModel[],
  ) {
    this.instanceTab = new InstanceStencilTab(
      stencilElement,
      scroller,
      service,
    );
    this.inventoryTab = new InventoryStencilTab(
      stencilElement,
      scroller,
      serviceInventories,
      serviceModels,
    );

    this.tabsToolbar = new ui.Toolbar({
      id: "tabs-toolbar",
      tools: [
        {
          type: "button",
          name: "new_tab",
          text: "New",
          id: "new-tab",
        },
        {
          type: "button",
          name: "inventory_tab",
          text: "Inventory",
          id: "inventory-tab",
        },
      ],
    });

    stencilElement.appendChild(this.tabsToolbar.el);
    this.tabsToolbar.render();

    const firstChild = this.tabsToolbar.el.firstElementChild;
    const targetElement = firstChild?.firstElementChild;

    //adding active class to the first tab as a default, as Toolbar doesn't apply it when adding 'class' attribute to the tool object
    if (targetElement?.classList) {
      targetElement.classList.add("-active");
    }

    this.tabsToolbar.on("new_tab:pointerclick", (event: dia.Event) => {
      if (event.target.classList.contains("-active")) {
        return;
      }
      this.inventoryTab.stencil.el.classList.add("joint-hidden");
      this.inventoryTab.stencil.freeze();

      this.instanceTab.stencil.el.classList.remove("joint-hidden");
      this.instanceTab.stencil.unfreeze();

      event.target.classList.add("-active");
      event.target.nextSibling.classList.remove("-active");
    });

    this.tabsToolbar.on("inventory_tab:pointerclick", (event: dia.Event) => {
      if (event.target.classList.contains("-active")) {
        return;
      }

      this.instanceTab.stencil.el.classList.add("joint-hidden");
      this.instanceTab.stencil.freeze();

      this.inventoryTab.stencil.el.classList.remove("joint-hidden");
      this.inventoryTab.stencil.unfreeze();

      event.target.classList.add("-active");
      event.target.previousSibling.classList.remove("-active");
    });
  }

  remove(): void {
    this.instanceTab.stencil.remove();
    this.inventoryTab.stencil.remove();
    this.tabsToolbar.remove();
  }
}
