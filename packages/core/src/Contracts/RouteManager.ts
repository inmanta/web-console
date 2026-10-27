import {
  RouteKind,
  Route,
  RouteParams,
  RouteMatch,
  Crumb,
  RouteKindWithId,
} from "@inmanta/web-console-core/Domain";

export interface RouteManager {
  isBaseUrlDefined(): boolean;
  getRoutes(): Route[];

  /**
   * Whether a route of this kind is registered. Links to a route of another feature check this
   * first, so they are hidden instead of broken when that feature is not part of the app.
   */
  has(kind: RouteKind): boolean;

  /**
   * @throws when no route of this kind is registered
   */
  getRoute<K extends RouteKind>(routeKind: K): Route<K>;

  /**
   * Generates a url based on the provided routeKind and routeParams
   */
  getUrl<K extends RouteKind>(kind: K, params: RouteParams<K>): string;

  /**
   * Generates a url based on the provided api uri.
   * If the api uri does not correspond to a registered route,
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

  /**
   * Gets the compile details route and params for a compile report api uri.
   * Returns undefined when the uri is not a compile report or the route is not registered.
   */
  getParamsFromUrl(uri: string): RouteKindWithId<"CompileDetails"> | undefined;
}
