import { RouteKind, Route, RouteParams } from "@/Core/Domain";

export type RouteDictionary = Record<RouteKind, Route>;

export interface RouteManager {
  getRoutes(): Route[];
  getRouteDictionary(): RouteDictionary;
  getRoute(routeKind: RouteKind): Route;
  getUrl(kind: RouteKind, params: RouteParams<typeof kind>): string;
}
