import { dia, linkTools, shapes } from "@inmanta/rappid";
import { LinkShape } from "./LinkShape";
import { getEntitiesFromCanvas, isServiceEntityShapeCell, removeConnectionsBetweenShapes, canRemoveLink } from "../../Data/Helpers";
import { routerNamespace, anchorNamespace } from "..";
import { ServiceEntityShape } from "./ServiceEntityShape";
import { words } from "@/UI/words";
import { RelationsDictionary } from "../../Data/Helpers/createRelationsDictionary";
import { ServiceModel } from "@/Core";

export class ComposerPaper {
    paper: dia.Paper;

    constructor(graph: dia.Graph, editable: boolean, relationsDictionary: RelationsDictionary, serviceCatalog: ServiceModel[]) {
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
                    // Check both directions to ensure the connection is valid from both sides
                    const sourceToTargetAllowed = sourceEntityBlock.validateConnection(targetEntityBlock);
                    const targetToSourceAllowed = targetEntityBlock.validateConnection(sourceEntityBlock);
                    return sourceToTargetAllowed && targetToSourceAllowed && baseValidators;
                }

                return false;
            },
        });

        // Event handlers for blank:pointerdown and cell:pointerup are set up in Composer.tsx
        // to have access to React state setters

        /**
         * Event handler for when the user hovers over a link.
         * Shows entity labels and conditionally displays the remove tool based on validation.
         */
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

            // Only show remove tool if composer is editable and removal is allowed
            if (!editable) {
                return;
            }

            // Check if removal is allowed - only show remove tool if it is
            const canRemove = canRemoveLink(sourceCell, targetCell, graph, relationsDictionary, serviceCatalog);
            if (!canRemove) {
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
                action: (_evt, linkView: dia.LinkView, toolView) => {
                    const { model } = linkView;
                    const source = model.source();
                    const target = model.target();

                    if (!source.id || !target.id) {
                        return;
                    }

                    const sourceShape = graph.getCell(source.id) as ServiceEntityShape | undefined;
                    const targetShape = graph.getCell(target.id) as ServiceEntityShape | undefined;

                    if (!sourceShape || !targetShape) {
                        return;
                    }

                    // Validate removal before proceeding (safety check, even though tool is only shown if allowed)
                    if (!canRemoveLink(sourceShape, targetShape, graph, relationsDictionary, serviceCatalog)) {
                        return;
                    }

                    // Remove connections from both shapes before removing the link
                    removeConnectionsBetweenShapes(sourceShape, targetShape);

                    // Remove the link from the graph
                    model.remove({ ui: true, tool: toolView.cid });
                },
            });

            const tools = new dia.ToolsView({
                tools: [removeTool],
            });

            linkView.addTools(tools);
        });

        /**
         * Event handler for when the user leaves a link.
         * Cleans up tools and labels.
         */
        this.paper.on("link:mouseleave", (linkView: dia.LinkView) => {
            linkView.removeTools();
            linkView.model.labels([]);
        });

        // Event triggered when the user hovers over a cell (shape).
        this.paper.on("element:mouseenter", (elementView: dia.ElementView) => {
            const cellModel = elementView.model;
            if (!isServiceEntityShapeCell(cellModel)) {
                return;
            }

            const shape = cellModel as ServiceEntityShape;

            const parts: string[] = [];

            // Missing connections message(s)
            if (shape.isMissingConnections()) {
                const missingConnections = shape.getMissingConnections();
                const connectionLines = missingConnections.map((conn) => {
                    const line =
                        conn.required === 1
                            ? words("instanceComposer.tooltip.missingConnectionSingle")(conn.name)
                            : words("instanceComposer.tooltip.missingConnectionMultiple")(
                                conn.name,
                                conn.missing,
                                conn.required
                            );
                    return `<div>${line}</div>`;
                });
                parts.push(...connectionLines);
            }

            // Missing required attribute message
            shape.validateAttributes();
            if (shape.hasAttributeValidationErrors) {
                // Small visual separation when both types of errors are present
                if (parts.length > 0) {
                    parts.push(`<div style="margin-top: 2px;"></div>`);
                }
                parts.push(`<div>${words("instanceComposer.tooltip.missingRequiredAttributes")}</div>`);
            }

            if (parts.length === 0) {
                return;
            }

            const tooltipText = parts.join("");

            // Set tooltip attribute on the root element (entire shape) for full hover coverage
            const rootEl = elementView.el;
            if (rootEl) {
                rootEl.setAttribute("data-tooltip", tooltipText);
                rootEl.setAttribute("data-tooltip-position", "top");
            }
        });

        // Event triggered when the user leaves a cell (shape).
        this.paper.on("element:mouseleave", (elementView: dia.ElementView) => {
            const cellModel = elementView.model;
            if (!isServiceEntityShapeCell(cellModel)) {
                return;
            }

            // Remove tooltip attribute from the root element when leaving the shape
            const rootEl = elementView.el;
            if (rootEl) {
                rootEl.removeAttribute("data-tooltip");
                rootEl.removeAttribute("data-tooltip-position");
            }
        });
    }
}