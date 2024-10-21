import { dia, ui } from "@inmanta/rappid";
import { ServiceModel } from "@/Core";
import { Inventories } from "@/Data/Managers/V2/GETTERS/GetInventoryList";
import { InstanceStencilTab } from "./instanceStencil";
import { InventoryStencilTab } from "./inventoryStencil";

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
