import { RouteKind, Route, RouteParams } from "@/Core/Domain";

export type RouteDictionary = Record<RouteKind, Route>;

export interface RouteManager {
  getRoutes(): Route[];
  getRouteDictionary(): RouteDictionary;
  getRoute(routeKind: RouteKind): Route;
  getUrl(kind: RouteKind, params: RouteParams<typeof kind>): string;
  /**
   * Gets the closest url in the lineage without params.
   * When switching environments, we can't go to pages with params,
   * because the params are environment specific.
   * @param url the current location.pathname
   */
  getRelatedUrlWithoutParams(url: string): string;
}
