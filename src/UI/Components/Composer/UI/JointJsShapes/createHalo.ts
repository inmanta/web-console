import { dia, highlighters, ui } from "@joint/plus";
import { t_global_border_radius_small } from "@patternfly/react-tokens";
import { RelationsDictionary, checkIfConnectionIsAllowed } from "../../Data/Helpers";
import { isServiceEntityShapeCell } from "../../Data/Helpers/getEntitiesFromCanvas";
import { ServiceEntityShape } from "./ServiceEntityShape";

const makeSvgIcon = (...paths: string[]): string => {
  const pathEls = paths.map((d) => `<path fill="white" d="${d}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="3" fill="#0066CC"/>${pathEls}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// BiLayerMinus: layers are visible — click to collapse
const COLLAPSE_LAYERS_ICON = makeSvgIcon(
  "m2.513 12.833 9.022 5.04a.995.995 0 0 0 .973.001l8.978-5a1 1 0 0 0-.002-1.749l-9.022-5a1 1 0 0 0-.968-.001l-8.978 4.96a1 1 0 0 0-.003 1.749zm9.464-4.69 6.964 3.859-6.917 3.853-6.964-3.89 6.917-3.822z",
  "m3.485 15.126-.971 1.748 9 5a1 1 0 0 0 .971 0l9-5-.971-1.748L12 19.856l-8.515-4.73zM16 4h6v2h-6z"
);

// BiLayerPlus: layers are hidden — click to expand
const EXPAND_LAYERS_ICON = makeSvgIcon(
  "m21.484 11.125-9.022-5a1 1 0 0 0-.968-.001l-8.978 4.96a1 1 0 0 0-.003 1.749l9.022 5.04a.995.995 0 0 0 .973.001l8.978-5a1 1 0 0 0-.002-1.749zm-9.461 4.73-6.964-3.89 6.917-3.822 6.964 3.859-6.917 3.853z",
  "M12 22a.994.994 0 0 0 .485-.126l9-5-.971-1.748L12 19.856l-8.515-4.73-.971 1.748 9 5A1 1 0 0 0 12 22zm8-20h-2v2h-2v2h2v2h2V6h2V4h-2z"
);

export const getConnectedLayerData = (
  graph: dia.Graph,
  shape: ServiceEntityShape
): { shapes: ServiceEntityShape[]; links: dia.Link[] } => {
  // BFS using the connections map rather than graph links.
  // The connections map is set synchronously when shapes are created, so this works
  // even before JointJS links are established (e.g. immediately after a stencil drop).
  // It also handles links created in either direction between parent and child shapes.
  const visitedIds = new Set<string | number>([shape.id]);
  const layerShapes: ServiceEntityShape[] = [];
  const toVisit: ServiceEntityShape[] = [shape];

  while (toVisit.length > 0) {
    const current = toVisit.pop()!;

    current.connections.forEach((targetIds) => {
      targetIds.forEach((targetId) => {
        if (visitedIds.has(targetId)) return;
        const otherCell = graph.getCell(targetId);
        if (!isServiceEntityShapeCell(otherCell)) return;

        const otherShape = otherCell as ServiceEntityShape;
        if (otherShape.entityType === "embedded" || otherShape.entityType === "relation") {
          visitedIds.add(targetId);
          layerShapes.push(otherShape);
          toVisit.push(otherShape);
        }
      });
    });
  }

  // Collect all links where at least one endpoint is a discovered layer shape.
  // This covers parent→child links, cross-links between siblings, and links
  // from nested shapes to other shapes that stay visible (e.g. core entities).
  const layerShapeIds = new Set(layerShapes.map((s) => s.id));
  const layerLinks = graph.getLinks().filter((link) => {
    const srcId = link.getSourceCell()?.id;
    const tgtId = link.getTargetCell()?.id;
    return (
      (srcId !== undefined && layerShapeIds.has(srcId)) ||
      (tgtId !== undefined && layerShapeIds.has(tgtId))
    );
  });

  return { shapes: layerShapes, links: layerLinks };
};

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

const updateMissingConnectionsHighlight = (paper: dia.Paper, shape: ServiceEntityShape) => {
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

  // When layers are collapsed, check whether any hidden child has validation errors
  let hasInvalidCollapsedLayers = false;
  if (shapeToCheck.isLayersCollapsed) {
    const graph = paper.model as dia.Graph;
    const { shapes: layerShapes } = getConnectedLayerData(graph, shapeToCheck);
    hasInvalidCollapsedLayers = layerShapes.some((child) => {
      child.validateAttributes();
      return child.isMissingConnections() || child.hasAttributeValidationErrors;
    });
  }

  if (hasConnectionErrors || hasAttributeErrors || hasInvalidCollapsedLayers) {
    // Add single red highlight for any validation issue (connections or attributes)
    highlighters.mask.add(shapeView, "body", MISSING_CONNECTIONS_HIGHLIGHT_NAME, {
      padding: 0,
      className: "halo-highlight-missing",
      attrs: {
        "stroke-opacity": 0.8,
        "stroke-width": 5,
        stroke: "var(--pf-t--global--border--color--status--danger--default)",
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
export const updateAllMissingConnectionsHighlights = (paper: dia.Paper | null) => {
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
  } catch {
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

    const shape = cellModel as ServiceEntityShape;
    const { shapes: layerShapes, links: layerLinks } = getConnectedLayerData(graph, shape);

    if (layerShapes.length > 0) {
      halo.addHandle({
        name: "toggle-layers",
        position: "nw",
        icon: shape.isLayersCollapsed ? EXPAND_LAYERS_ICON : COLLAPSE_LAYERS_ICON,
        attrs: {
          ".handle": {
            "data-tooltip": shape.isLayersCollapsed ? "Expand layers" : "Collapse layers",
            "data-tooltip-position": "bottom",
          },
        },
      });

      halo.on("action:toggle-layers:pointerdown", () => {
        shape.isLayersCollapsed = !shape.isLayersCollapsed;
        const displayValue = shape.isLayersCollapsed ? "none" : "";
        layerShapes.forEach((s) => s.attr("root/display", displayValue));
        layerLinks.forEach((l) => l.attr("root/display", displayValue));

        // Recheck validity so the red halo and tooltip reflect the new collapsed state
        updateMissingConnectionsHighlight(paper, shape);

        const handleEl = halo.el?.querySelector(".handle.toggle-layers") as HTMLElement | null;
        if (handleEl) {
          handleEl.style.backgroundImage = `url("${shape.isLayersCollapsed ? EXPAND_LAYERS_ICON : COLLAPSE_LAYERS_ICON}")`;
          handleEl.setAttribute(
            "data-tooltip",
            shape.isLayersCollapsed ? "Expand layers" : "Collapse layers"
          );
        }
      });
    }
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
