import { RouteKind, RouteManager } from "@/Core";
import { generatePath } from "react-router-dom";

import { getRouteWithParamsFromUrl, getLineageFromRoute } from "./Utils";

interface Crumb {
  kind: RouteKind;
  label: string;
  url: string;
  active: boolean;
}

export function getCrumbs(routeManager: RouteManager, url: string): Crumb[] {
  const routeWithParams = getRouteWithParamsFromUrl(
    routeManager.getRoutes(),
    url
  );
  if (typeof routeWithParams === "undefined") return [];
  const [route, params] = routeWithParams;
  const lineage = getLineageFromRoute(routeManager, route);
  return lineage.map(({ kind, label, path }, idx) => ({
    kind,
    label,
    url: generatePath(path, params),
    active: idx === lineage.length - 1,
  }));
}
