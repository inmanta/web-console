import { dia, ui } from "@inmanta/rappid";
import { ServiceModel } from "@/Core";
import { Inventories } from "@/Data/Managers/V2/GetRelatedInventories";
import { ServiceEntityBlock } from "../shapes";
import {
  createStencilElement,
  createStencilDraggableShape,
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
      dragStartClone: (cell: dia.Cell) =>
        createStencilDraggableShape(cell, true),
      dragEndClone: (el) => {
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
  ) {
    const groups = {};

    //Create object with service names as keys and all of the service instances as StencilElements, to be used in the Stencil Sidebar
    Object.keys(serviceInventories).forEach(
      (serviceName) =>
        (groups[serviceName] = serviceInventories[serviceName].map((service) =>
          createStencilElement(service.service_entity),
        )),
    );

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
        const name = cell.get("name");

        return new ServiceEntityBlock().setName(name);
      },
      dragEndClone: (el) => {
        return el.clone();
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
