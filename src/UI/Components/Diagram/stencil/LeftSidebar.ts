import { ui } from "@inmanta/rappid";
import { ServiceModel } from "@/Core";
import { Inventories } from "@/Data/Queries";
import { InstanceStencilTab } from "./instanceStencil";
import { InventoryStencilTab } from "./inventoryStencil";
import { words } from "@/UI/words";

/**
 * Class representing the left sidebar.
 * It contains the instance and inventory tabs.
 * It is a toolbar containing templates for instances and embedded entities.
 * As well as the list of exisiting instances in the inventory.
 */
export class LeftSidebar {
  instanceTab: InstanceStencilTab;
  inventoryTab: InventoryStencilTab;
  tabsToolbar: ui.Toolbar;


  /**
   * Creates the left sidebar.
   * This is the container for the instance and inventory tabs.
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
    serviceModels: ServiceModel[]
  ) {
    this.instanceTab = new InstanceStencilTab(stencilElement, scroller, service);
    this.inventoryTab = new InventoryStencilTab(
      stencilElement,
      scroller,
      serviceInventories,
      serviceModels
    );

    this.tabsToolbar = new ui.Toolbar({
      id: "tabs-toolbar",
      tools: [],
    });

    const tabButtons: HTMLElement = document.createElement("div");

    tabButtons.classList.add("pf-v6-c-tabs", "pf-m-inset-lg");
    tabButtons.role = "region";
    tabButtons.innerHTML = `
        <ul class="pf-v6-c-tabs__list" role="tablist" aria-label="stencil-sidebar-tabs">
          <li class="pf-v6-c-tabs__item  pf-m-current" role="presentation" id="new-tab">
            <button
              type="button"
              class="pf-v6-c-tabs__link"
              role="tab"
              name="new_tab"
            >
              <span class="pf-v6-c-tabs__item-text">${words("instanceComposer.stencil.new")}</span>
            </button>
          </li>
          <li class="pf-v6-c-tabs__item" role="presentation" id="inventory-tab">
            <button
              type="button"
              class="pf-v6-c-tabs__link"
              role="tab"
              name="inventory_tab"
            >
              <span class="pf-v6-c-tabs__item-text">${words("instanceComposer.stencil.inventory")}</span>
            </button>
          </li>
        </ul>
     `;

    tabButtons.addEventListener("click", (event: Event) => {
      !!event.target && this.toggleTab(event.target);
    });

    this.tabsToolbar.el.appendChild(tabButtons);
    stencilElement.appendChild(this.tabsToolbar.el);
    this.tabsToolbar.render();
  }

  /**
   * Toggles the visibility of the tabs by freezing and unfreezing the old and new tabs
   * and adding and removing the joint-hidden class.
   * 
   * @private
   * @param newActiveTab - The new active tab.
   * @param oldActiveTab - The old active tab.
   * @param newTabId - The id of the new tab.
   */
  private toggleTabVisibility = (newActiveTab: Tab, oldActiveTab: Tab, newTabId: string) => {
    oldActiveTab.stencil.el.classList.add("joint-hidden");
    oldActiveTab.stencil.freeze();

    newActiveTab.stencil.el.classList.remove("joint-hidden");
    newActiveTab.stencil.unfreeze();

    const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(
      '[aria-label="stencil-sidebar-tabs"] li'
    );

    tabs.forEach((tab) => tab.classList.toggle("pf-m-current", tab.id === newTabId));
  };

  /**
   * Toggles the visibility of the tabs by freezing and unfreezing the old and new tabs
   * and adding and removing the joint-hidden class.
   * 
   * @public
   * @param clickedElement - The clicked element.
   */
  public toggleTab = (clickedElement: EventTarget) => {
    if (clickedElement instanceof HTMLElement) {
      // The clickedElement can also be the entire tabContainer, which we don't want to react on.
      clickedElement.innerText === "Inventory" &&
        this.toggleTabVisibility(this.inventoryTab, this.instanceTab, "inventory-tab");

      clickedElement.innerText === "New" &&
        this.toggleTabVisibility(this.instanceTab, this.inventoryTab, "new-tab");
    }
  };


  remove(): void {
    this.instanceTab.stencil.remove();
    this.inventoryTab.stencil.remove();
    this.tabsToolbar.remove();
  }
}

type Tab = InstanceStencilTab | InventoryStencilTab;
