import React from "react";
import { ui } from "@inmanta/rappid";
import { Inventories } from "@/Data/Queries";
import { ServiceModel } from "@/Core";


export const LeftSidebar: React.FC = () => {
    return <div>LeftSidebar</div>;
}

class LeftSidebarElement {
    constructor(
        htmlRef: HTMLElement,
        scroller: ui.PaperScroller,
        serviceInventories: Inventories,
        service: ServiceModel
    ){}
}

class InstanceTabElement {}

class InventoryTabElement {}