import { dia, highlighters, ui } from "@joint/plus";
import { t_global_border_radius_small } from "@patternfly/react-tokens";
import { words } from "@/UI/words";
import { RelationsDictionary, checkIfConnectionIsAllowed } from "../../Data/Helpers";
import { isServiceEntityShapeCell } from "../../Data/Helpers/getEntitiesFromCanvas";
import collapseLayersIcon from "../icons/collapse-layers.svg";
import expandAllLayersIcon from "../icons/expand-all-layers.svg";
import expandLayersIcon from "../icons/expand-layers.svg";
import linkIcon from "../icons/link.svg";
import { ServiceEntityShape } from "./ServiceEntityShape";

/**
 * Returns only the direct (first-layer) children of a shape and the links that
 * connect the parent to those children (or siblings to each other).
 * Links that go deeper than one level are excluded so they remain hidden when
 * only the first layer is expanded.
 */
export const getDirectLayerData = (
  graph: dia.Graph,
  shape: ServiceEntityShape
): { shapes: ServiceEntityShape[]; links: dia.Link[] } => {
  const directShapeIds = new Set<string | number>();
  const directShapes: ServiceEntityShape[] = [];

  shape.connections.forEach((targetIds) => {
    targetIds.forEach((targetId) => {
      if (directShapeIds.has(targetId)) {
        return;
      }

      const otherCell = graph.getCell(targetId);
      if (!isServiceEntityShapeCell(otherCell)) {
        return;
      }

      const otherShape = otherCell as ServiceEntityShape;
      // Skip upward traversal (parent → this shape direction).
      // Handles all entity types including "core" inter-service relation targets.
      if (shape.parentIds.has(targetId)) {
        return;
      }

      directShapeIds.add(targetId);
      directShapes.push(otherShape);
    });
  });

  // Only include links where both endpoints are visible (parent or a direct child).
  // This excludes links from direct children down to grandchildren.
  const visibleIds = new Set([shape.id, ...directShapeIds]);
  const directLinks = graph.getLinks().filter((link) => {
    const srcId = link.getSourceCell()?.id;
    const tgtId = link.getTargetCell()?.id;

    return (
      srcId !== undefined && tgtId !== undefined && visibleIds.has(srcId) && visibleIds.has(tgtId)
    );
  });

  return { shapes: directShapes, links: directLinks };
};

/**
 * Reveals the first-layer children of a collapsed shape.
 * Call this before removing a shape so its direct children remain visible on the canvas.
 */
export const revealDirectChildren = (graph: dia.Graph, shape: ServiceEntityShape): void => {
  if (!shape.isLayersCollapsed) {
    return;
  }
  const { shapes: directShapes, links: directLinks } = getDirectLayerData(graph, shape);

  directShapes.forEach((s) => s.attr("root/display", ""));
  directLinks.forEach((l) => l.attr("root/display", ""));
};

export const getConnectedLayerData = (
  graph: dia.Graph,
  shape: ServiceEntityShape
): { shapes: ServiceEntityShape[]; links: dia.Link[] } => {
  // Breadth-first search using the connections map so it works even before JointJS links are established
  // (e.g. immediately after a stencil drop).
  //
  // The connections map is bidirectional: a child stores its parent's ID (rootEntities)
  // alongside its own children. We use each shape's parentIds set (populated from
  // rootEntities at construction) to detect upward traversal: if the target ID is a known
  // parent of the current node, the traversal is going up the tree and should be skipped.
  // When parentIds is empty (connections set post-construction via InventoryTabElement),
  // we fall back to including the target so discovery still works.
  const visitedIds = new Set<string | number>([shape.id]);
  const layerShapes: ServiceEntityShape[] = [];
  const toVisit: ServiceEntityShape[] = [shape];

  while (toVisit.length > 0) {
    const current = toVisit.pop()!;

    current.connections.forEach((targetIds) => {
      targetIds.forEach((targetId) => {
        if (visitedIds.has(targetId)) {
          return;
        }
        const otherCell = graph.getCell(targetId);
        if (!isServiceEntityShapeCell(otherCell)) {
          return;
        }

        const otherShape = otherCell as ServiceEntityShape;

        // Skip if targetId is a known parent of the current node (upward traversal via rootEntities).
        // This handles all entity types including "core" inter-service relation targets.
        if (current.parentIds.has(targetId)) {
          return;
        }

        visitedIds.add(targetId);
        layerShapes.push(otherShape);
        toVisit.push(otherShape);
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
    icon: linkIcon,
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
        icon: shape.isLayersCollapsed ? expandLayersIcon : collapseLayersIcon,
        attrs: {
          ".handle": {
            "data-tooltip": shape.isLayersCollapsed
              ? words("instanceComposer.halo.expandLayers")
              : words("instanceComposer.halo.collapseLayers"),
            "data-tooltip-position": "bottom",
          },
        },
      });

      halo.on("action:toggle-layers:pointerdown", () => {
        shape.isLayersCollapsed = !shape.isLayersCollapsed;

        if (shape.isLayersCollapsed) {
          // Collapse: hide all nested layers recursively and mark each as collapsed
          // so their halos show the correct expand icon when re-revealed later
          layerShapes.forEach((s) => {
            s.attr("root/display", "none");
            s.isLayersCollapsed = true;
          });
          layerLinks.forEach((l) => l.attr("root/display", "none"));
        } else {
          // Expand: show only the first layer (direct children)
          const { shapes: directShapes, links: directLinks } = getDirectLayerData(graph, shape);
          directShapes.forEach((s) => s.attr("root/display", ""));
          directLinks.forEach((l) => l.attr("root/display", ""));
        }

        // Recheck validity so the red halo and tooltip reflect the new collapsed state
        updateMissingConnectionsHighlight(paper, shape);

        const handleEl = halo.el?.querySelector(".handle.toggle-layers") as HTMLElement | null;
        if (handleEl) {
          handleEl.style.backgroundImage = `url("${shape.isLayersCollapsed ? expandLayersIcon : collapseLayersIcon}")`;
          handleEl.setAttribute(
            "data-tooltip",
            shape.isLayersCollapsed
              ? words("instanceComposer.halo.expandLayers")
              : words("instanceComposer.halo.collapseLayers")
          );
        }
      });

      halo.addHandle({
        name: "expand-all-layers",
        position: "n",
        icon: expandAllLayersIcon,
        attrs: {
          ".handle": {
            "data-tooltip": words("instanceComposer.halo.expandAllLayers"),
            "data-tooltip-position": "bottom",
          },
        },
      });

      halo.on("action:expand-all-layers:pointerdown", () => {
        shape.isLayersCollapsed = false;
        layerShapes.forEach((s) => {
          s.attr("root/display", "");
          s.isLayersCollapsed = false;
        });
        layerLinks.forEach((l) => l.attr("root/display", ""));

        updateMissingConnectionsHighlight(paper, shape);

        // Sync the toggle button to show "collapse" since all layers are now visible
        const handleEl = halo.el?.querySelector(".handle.toggle-layers") as HTMLElement | null;
        if (handleEl) {
          handleEl.style.backgroundImage = `url("${collapseLayersIcon}")`;
          handleEl.setAttribute("data-tooltip", words("instanceComposer.halo.collapseLayers"));
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
