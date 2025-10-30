import { dia, ui } from "@inmanta/rappid";
import { Inventories } from "@/Data/Queries";
import { ServiceModel } from "@/Core";

const GRID_SIZE = 8;
const PADDING_S = GRID_SIZE;

export class InventoryTabElement {
    stencil: ui.Stencil;
    constructor(
        htmlRef: HTMLElement,
        scroller: ui.PaperScroller,
        serviceInventories: Inventories,
        serviceModels: ServiceModel[]
    ) {
        const groups = {};
        console.log("serviceInventories", serviceInventories);

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
        });

        htmlRef.appendChild(this.stencil.el);
        this.stencil.el.querySelector(".search")?.classList.add("pf-v6-c-text-input-group__text-input");

        this.stencil.render();
        this.stencil.load(groups);
        this.stencil.freeze();
    }

}