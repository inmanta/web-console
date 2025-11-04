import { dia, shapes } from "@inmanta/rappid";
import { LinkShape } from "./LinkShape";
import { getEntitiesFromCanvas } from "../../Data/Helpers";
import { routerNamespace, anchorNamespace } from "..";
import { ServiceEntityShape } from "./ServiceEntityShape";

export class ComposerPaper {
    paper: dia.Paper;

    constructor(graph: dia.Graph, editable: boolean) {
        this.paper = new dia.Paper({
            model: graph,
            width: 1000,
            height: 1000,
            gridSize: 1,
            interactive: { linkMove: false },
            defaultConnectionPoint: {
                name: "boundary",
                args: {
                    extrapolate: true,
                    sticky: true,
                },
            },
            defaultConnector: { name: "rounded" },
            async: true,
            frozen: true,
            sorting: dia.Paper.sorting.APPROX,
            cellViewNamespace: shapes,
            routerNamespace: routerNamespace,
            defaultRouter: { name: "customRouter" },
            anchorNamespace: anchorNamespace,
            defaultAnchor: { name: "customAnchor" },
            snapLinks: true,
            linkPinning: false,
            magnetThreshold: 0,
            background: { color: "transparent" },
            highlighting: {
                connecting: {
                    name: "addClass",
                    options: {
                        className: "column-connected",
                    },
                },
            },
            defaultLink: () => new LinkShape(),
            validateConnection: (sourceView, srcMagnet, targetView, tgtMagnet) => {
                const baseValidators = srcMagnet !== tgtMagnet && sourceView.cid !== targetView.cid;

                const serviceEntityShapes: ServiceEntityShape[] = getEntitiesFromCanvas(graph);

                const sourceEntityBlock: ServiceEntityShape | undefined = serviceEntityShapes.find((entity) => entity.cid === sourceView.model.cid);
                const targetEntityBlock: ServiceEntityShape | undefined = serviceEntityShapes.find((entity) => entity.cid === targetView.model.cid);

                if (sourceEntityBlock && targetEntityBlock) {
                    const isAllowed = sourceEntityBlock.validateConnection(targetEntityBlock);
                    return isAllowed && baseValidators;
                }

                return false;
            },
        });

        // Event Triggered when the user clicks on a blank space of the canvas.
        this.paper.on("blank:pointerdown", () => {

        });

        // Event Triggered when the user clicks on a cell of the canvas.
        this.paper.on("cell:pointerup", (cellView: dia.CellView) => {
        });

        // Event Triggered when the user hovers over a link.
        this.paper.on("link:mouseenter", (linkView: dia.LinkView) => {
        });

        // Event Triggered when the user leaves a link.
        this.paper.on("link:mouseleave", (linkView: dia.LinkView) => {
        });

        // Event Triggered when the user connects two cells.
        this.paper.on("link:connect", (linkView: dia.LinkView) => {
        });
    }
}