import { generatePath } from "react-router-dom";
import { RouteKind, RouteManager } from "@/Core";

interface Crumb {
  kind: RouteKind;
  label: string;
  url: string;
  active: boolean;
}

export function getCrumbs(routeManager: RouteManager, url: string): Crumb[] {
  const routeMatch = routeManager.getRouteMatchFromUrl(url);
  if (typeof routeMatch === "undefined") return [];
  const { route, params } = routeMatch;
  const lineage = routeManager.getLineageFromRoute(route);
  return lineage.map(({ kind, generateLabel, path }, idx) => ({
    kind,
    label: generateLabel(params),
    url: generatePath(path, params),
    active: idx === lineage.length - 1,
  }));
}
