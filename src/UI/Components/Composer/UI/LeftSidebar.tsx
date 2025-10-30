import React, { useContext, useEffect, useRef, useState } from "react";
import { ui } from "@inmanta/rappid";
import { Inventories } from "@/Data/Queries";
import { ServiceModel } from "@/Core";
import { ComposerContext } from "../Data/Context";
import styled from "styled-components";
import { InstanceTabElement, InventoryTabElement } from "./JointJsShapes";
import { words } from "@/UI/words";



export const LeftSidebar: React.FC = () => {
  const { scroller, serviceInventories, mainService, editable, serviceCatalog } = useContext(ComposerContext);
  const [sidebar, setSidebar] = useState<LeftSidebarElement | null>(null);
  const LeftSidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!LeftSidebarRef.current || !scroller || !serviceInventories || !mainService) {
      return;
    }

    const sidebar = new LeftSidebarElement(LeftSidebarRef.current, scroller, serviceInventories, serviceCatalog, mainService);
    setSidebar(sidebar);

    return () => {
      sidebar.remove();
    };
  }, [scroller, serviceInventories, mainService, serviceCatalog]);


  return <LeftSidebarStyling
    className={`left_sidebar ${!editable && "view_mode"}`}
    data-testid="left_sidebar"
    ref={LeftSidebarRef} />;
}

class LeftSidebarElement {
  instanceTab: InstanceTabElement;
  inventoryTab: InventoryTabElement;
  tabsToolbar: ui.Toolbar;

  constructor(
    htmlRef: HTMLElement,
    scroller: ui.PaperScroller,
    serviceInventories: Inventories,
    serviceModels: ServiceModel[],
    service: ServiceModel
  ) {
    // Create the tabs toolbar first and prepend it
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
    htmlRef.appendChild(this.tabsToolbar.el);
    this.tabsToolbar.render();

    // Now create the stencil tabs after the toolbar
    this.instanceTab = new InstanceTabElement(htmlRef, scroller, service);
    this.inventoryTab = new InventoryTabElement(htmlRef, scroller, serviceInventories, serviceModels);
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
      clickedElement.innerText === words("instanceComposer.stencil.inventory") &&
        this.toggleTabVisibility(this.inventoryTab, this.instanceTab, "inventory-tab");

      clickedElement.innerText === words("instanceComposer.stencil.new") &&
        this.toggleTabVisibility(this.instanceTab, this.inventoryTab, "new-tab");
    }
  };

  remove(): void {
    this.instanceTab.stencil.remove();
    this.inventoryTab.stencil.remove();
    this.tabsToolbar.remove();
  }
}

const LeftSidebarStyling = styled.div`
  position: relative;
  width: 240px;
  height: 100%;
  background: var(--pf-t--global--background--color--secondary--default);
  filter: drop-shadow(0.1rem 0.1rem 0.15rem var(--pf-t--global--box-shadow--color--100));
  z-index: 1;
  overflow: visible;

  &.view_mode {
    display: none;
  }

  #tabs-toolbar.joint-toolbar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 52px;
    z-index: 2;
    border: 0;
    background-color: var(--pf-t--global--background--color--secondary--default);
  }

  .joint-stencil {
    position: absolute;
    top: 52px;
    left: 0;
    right: 0;
    bottom: 0;
    border: 0;
    background-color: var(--pf-t--global--background--color--primary--default);

    &.joint-hidden {
      visibility: hidden;
    }

    .content {
      padding: 12px 0;
    }
  }
`;

type Tab = InstanceTabElement | InventoryTabElement;