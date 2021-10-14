import { generatePath } from "react-router-dom";
import { Kind } from "./Kind";
import { getRouteWithParamsFromUrl, getLineageFromRoute } from "./Utils";

interface Crumb {
  kind: Kind;
  label: string;
  url: string;
  active: boolean;
}

export function getCrumbs(url: string): Crumb[] {
  const routeWithParams = getRouteWithParamsFromUrl(url);
  if (typeof routeWithParams === "undefined") return [];
  const [route, params] = routeWithParams;
  const lineage = getLineageFromRoute(route);
  return lineage.map(({ kind, label, path }, idx) => ({
    kind,
    label,
    url: generatePath(path, params),
    active: idx === lineage.length - 1,
  }));
}
