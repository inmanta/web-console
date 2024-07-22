import { dia, ui } from "@inmanta/rappid";
import { ServiceModel } from "@/Core";
import { InventoriesResponse } from "@/Data/Managers/V2/GetRelatedInventories";
import { ServiceEntityBlock } from "../shapes";
import {
  createStencilElement,
  createStencilDraggableShape,
  transformEmbeddedToStencilElements,
} from "./helpers";

const GRID_SIZE = 8;
const PADDING_S = GRID_SIZE;

class InstanceStencil {
  stencil: ui.Stencil;

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
        background: "#fff",
      },
    });
    stencilElement.appendChild(this.stencil.el);
    this.stencil.render();
    this.stencil.load(transformEmbeddedToStencilElements(service));
  }
}

class InventoryStencil {
  stencil: ui.Stencil;

  constructor(
    stencilElement: HTMLElement,
    scroller: ui.PaperScroller,
    serviceInventories: InventoriesResponse,
  ) {
    const groups = {};
    Object.keys(serviceInventories).forEach(
      (serviceName) => (groups[serviceName] = {}),
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
        background: "#fff",
      },
    });
    stencilElement.appendChild(this.stencil.el);
    this.stencil.render();

    const groupedElements = {};
    Object.keys(serviceInventories).forEach(
      (serviceName) =>
        (groupedElements[serviceName] = serviceInventories[serviceName].map(
          (service) => createStencilElement(service.service_entity),
        )),
    );
    this.stencil.load(groupedElements);
    this.stencil.freeze(); //freeze by default as this tab is not active on init
  }
}

export class StencilSidebar {
  constructor(
    stencilElement: HTMLElement,
    scroller: ui.PaperScroller,
    serviceInventories: InventoriesResponse,
    service: ServiceModel,
  ) {
    const instanceStencil = new InstanceStencil(
      stencilElement,
      scroller,
      service,
    );
    const inventoryStencil = new InventoryStencil(
      stencilElement,
      scroller,
      serviceInventories,
    );
    const tabsToolbar = new ui.Toolbar({
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
    stencilElement.appendChild(tabsToolbar.el);
    tabsToolbar.render();

    tabsToolbar.el.firstElementChild?.firstElementChild?.classList?.add(
      "-active",
    ); //adding active class to the first tab as a default, as Toolbar doesn't apply it when adding 'class' attribute to the tool object

    tabsToolbar.on("new_tab:pointerclick", (event: dia.Event) => {
      if (event.target.classList.contains("-active")) return;
      inventoryStencil.stencil.el.classList.add("joint-hidden");
      inventoryStencil.stencil.freeze();

      instanceStencil.stencil.el.classList.remove("joint-hidden");
      instanceStencil.stencil.unfreeze();
      event.target.classList.add("-active");
      event.target.nextSibling.classList.remove("-active");
    });
    tabsToolbar.on("inventory_tab:pointerclick", (event: dia.Event) => {
      if (event.target.classList.contains("-active")) return;

      instanceStencil.stencil.el.classList.add("joint-hidden");
      instanceStencil.stencil.freeze();

      inventoryStencil.stencil.el.classList.remove("joint-hidden");
      inventoryStencil.stencil.unfreeze();
      event.target.classList.add("-active");
      event.target.previousSibling.classList.remove("-active");
    });
  }
}
