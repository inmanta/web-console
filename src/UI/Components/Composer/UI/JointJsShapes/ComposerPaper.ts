import { dia, linkTools, shapes } from "@inmanta/rappid";
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

        // Event handlers for blank:pointerdown and cell:pointerup are set up in Composer.tsx
        // to have access to React state setters

        // Event Triggered when the user hovers over a link.
        this.paper.on("link:mouseenter", (linkView: dia.LinkView) => {
            const source = linkView.model.source();
            const target = linkView.model.target();

            if (!source.id || !target.id) {
                return;
            }

            const sourceCell = graph.getCell(source.id) as ServiceEntityShape | undefined;
            const targetCell = graph.getCell(target.id) as ServiceEntityShape | undefined;

            if (!sourceCell || !targetCell) {
                return;
            }

            const appendLabel = (
                cell: ServiceEntityShape,
                orientSide: "target" | "source",
                distance: number
            ) => {
                const labelText = cell.getEntityName();

                if (!labelText || labelText.startsWith("_")) {
                    return;
                }

                linkView.model.appendLabel({
                    attrs: {
                        rect: {
                            fill: "none",
                        },
                        text: {
                            text: labelText,
                            "auto-orient": orientSide,
                            class: "joint-label-text",
                        },
                    },
                    position: {
                        distance,
                    },
                });
            };

            linkView.model.labels([]);
            appendLabel(sourceCell, "target", 1);
            appendLabel(targetCell, "source", 0);

            if (!editable || sourceCell.readonly || targetCell.readonly) {
                return;
            }

            const removeTool = new linkTools.Remove({
                distance: "50%",
                markup: [
                    {
                        tagName: "circle",
                        selector: "button",
                        attributes: {
                            r: 7,
                            class: "joint-link_remove-circle",
                            "stroke-width": 2,
                            cursor: "pointer",
                        },
                    },
                    {
                        tagName: "path",
                        selector: "icon",
                        attributes: {
                            d: "M -3 -3 3 3 M -3 3 3 -3",
                            class: "joint-link_remove-path",
                            "stroke-width": 2,
                            "pointer-events": "none",
                        },
                    },
                ],
                action: (_evt, view, toolView) => {
                    view.model.remove({ ui: true, tool: toolView.cid });
                },
            });

            const tools = new dia.ToolsView({
                tools: [removeTool],
            });

            linkView.addTools(tools);
        });

        // Event Triggered when the user leaves a link.
        this.paper.on("link:mouseleave", (linkView: dia.LinkView) => {
            linkView.removeTools();
            linkView.model.labels([]);
        });
    }
}