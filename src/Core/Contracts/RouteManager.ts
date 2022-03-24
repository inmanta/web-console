import {
  RouteKind,
  Route,
  RouteParams,
  RouteMatch,
  Crumb,
} from "@/Core/Domain";

export type RouteDictionary = Record<RouteKind, Route>;

export interface RouteManager {
  isBaseUrlDefined(): boolean;
  getRoutes(): Route[];
  getRouteDictionary(): RouteDictionary;
  getRoute<K extends RouteKind>(routeKind: K): Route<K>;
  /**
   * Generates a url based on the provided routeKind and routeParams
   */
  getUrl<K extends RouteKind>(kind: K, params: RouteParams<K>): string;
  /**
   * Generates a url based on the provided api uri.
   * If the api uri does not correspond to an existing route,
   * undefined is returned.
   */
  getUrlForApiUri(uri: string): string | undefined;
  /**
   * Gets the closest url in the lineage without params.
   * When switching environments, we can't go to pages with params,
   * because the params are environment specific.
   * @param pathname the current location.pathname
   */
  getRelatedUrlWithoutParams(pathname: string): string;
  /**
   * Return the list of parent routes including the route itself.
   * The route itself is the last in the list.
   * @param routes the buildup of parent routes as this is a recursive function
   */
  getLineageFromRoute(route: Route, routes?: Route[]): Route[];
  getRouteMatchFromUrl(url: string): RouteMatch | undefined;
  /**
   * Generates a url based the provided routeKind and routeParams
   * while preserving the current search.
   */
  useUrl(kind: RouteKind, params: RouteParams<RouteKind>): string;
  getCrumbs(url: string): Crumb[];
}
