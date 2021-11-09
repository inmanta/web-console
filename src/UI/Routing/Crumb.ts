import { generatePath } from "react-router-dom";
import { RouteKind, RouteManager } from "@/Core";

interface Crumb {
  kind: RouteKind;
  label: string;
  url: string;
  active: boolean;
}

export function getCrumbs(routeManager: RouteManager, url: string): Crumb[] {
  const routeWithParams = routeManager.getRouteWithParamsFromUrl(url);
  if (typeof routeWithParams === "undefined") return [];
  const [route, params] = routeWithParams;
  const lineage = routeManager.getLineageFromRoute(route);
  return lineage.map(({ kind, label, path }, idx) => ({
    kind,
    label,
    url: generatePath(path, params),
    active: idx === lineage.length - 1,
  }));
}
