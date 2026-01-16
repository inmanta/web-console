import { dia, highlighters, ui } from "@inmanta/rappid";
import { t_global_border_radius_small } from "@patternfly/react-tokens";
import { RelationsDictionary, checkIfConnectionIsAllowed } from "../../Data/Helpers";
import { ServiceEntityShape } from "./ServiceEntityShape";
import { isServiceEntityShapeCell } from "../../Data/Helpers/getEntitiesFromCanvas";

const HIGHLIGHT_NAME = "available-to-connect";
const MISSING_CONNECTIONS_HIGHLIGHT_NAME = "missing-connections";

const clearHighlights = (paper: dia.Paper) => {
    const area = paper.getArea();
    const shapes = paper.findViewsInArea(area);
    shapes.forEach((shape) => {
        const highlight = dia.HighlighterView.get(shape, HIGHLIGHT_NAME);
        if (highlight) {
            highlight.remove();
        }
    });
};

const updateMissingConnectionsHighlight = (
    paper: dia.Paper,
    shape: ServiceEntityShape
) => {
    const shapeView = paper.findViewByModel(shape);
    if (!shapeView) {
        return;
    }

    // Remove existing highlight if any
    const existingHighlight = dia.HighlighterView.get(shapeView, MISSING_CONNECTIONS_HIGHLIGHT_NAME);
    if (existingHighlight) {
        existingHighlight.remove();
    }

    const shapeToCheck = shapeView.model as ServiceEntityShape;

    // Refresh attribute validation state to reflect the latest attributes
    shapeToCheck.validateAttributes();

    const hasConnectionErrors = shapeToCheck.isMissingConnections();
    const hasAttributeErrors = shapeToCheck.hasAttributeValidationErrors;

    if (hasConnectionErrors || hasAttributeErrors) {
        // Add single red highlight for any validation issue (connections or attributes)
        highlighters.mask.add(shapeView, "body", MISSING_CONNECTIONS_HIGHLIGHT_NAME, {
            padding: 0,
            className: "halo-highlight-missing",
            attrs: {
                "stroke-opacity": 0.8,
                "stroke-width": 5,
                "stroke": "var(--pf-t--global--border--color--status--danger--default)",
                rx: t_global_border_radius_small.value,
                filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))",
            },
        });
    }
};

/**
 * Updates missing connections highlights for all shapes on the canvas
 * This should be called when connections are added or removed
 */
export const updateAllMissingConnectionsHighlights = (
    paper: dia.Paper | null
) => {
    if (!paper) {
        return;
    }
    try {
        const area = paper.getArea();
        if (!area) {
            return;
        }
        const shapes = paper.findViewsInArea(area);
        shapes.forEach((shapeView) => {
            if (isServiceEntityShapeCell(shapeView.model)) {
                // Use the shape from the view model to ensure we're checking the correct instance
                updateMissingConnectionsHighlight(paper, shapeView.model as ServiceEntityShape);
            }
        });
    } catch (e) {
        // Paper might not be ready yet, ignore errors
    }
};

export const createHalo = (
    graph: dia.Graph,
    paper: dia.Paper,
    cellView: dia.CellView,
    relationsDictionary: RelationsDictionary
): ui.Halo => {
    const halo = new ui.Halo({
        cellView,
        type: "toolbar",
        rx: t_global_border_radius_small.value,
    });

    const handlesToRemove = ["clone", "resize", "rotate", "fork", "unlink", "remove"];
    handlesToRemove.forEach((handle) => halo.removeHandle(handle));

    halo.changeHandle("link", {
        name: "link",
    });

    const cellModel = cellView.model;
    if (isServiceEntityShapeCell(cellModel)) {
        // Check and show red halo if any validation issues (connections or attributes) are present
        updateMissingConnectionsHighlight(paper, cellModel as ServiceEntityShape);
    }

    const highlightAvailableTargets = () => {
        const area = paper.getArea();
        const siblingShapes = paper
            .findViewsInArea(area)
            .filter((shape) => shape.cid !== cellView.cid && isServiceEntityShapeCell(shape.model));

        const connectableShapes = siblingShapes.filter((shape) =>
            checkIfConnectionIsAllowed(graph, shape, cellView, relationsDictionary)
        );

        connectableShapes.forEach((shape) => {
            highlighters.mask.add(shape, "body", HIGHLIGHT_NAME, {
                padding: 0,
                className: "halo-highlight",
                attrs: {
                    "stroke-opacity": 0.5,
                    "stroke-width": 10,
                    rx: t_global_border_radius_small.value,
                    filter: "drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4))",
                },
            });
        });
    };

    halo.on("remove", () => clearHighlights(paper));
    halo.on("action:link:pointerdown", highlightAvailableTargets);
    halo.on("action:link:add", () => {
        clearHighlights(paper);
        // Update missing connections highlight after a connection is added
        if (isServiceEntityShapeCell(cellModel)) {
            updateMissingConnectionsHighlight(paper, cellModel);
        }
        updateAllMissingConnectionsHighlights(paper);
    });

    return halo;
};

