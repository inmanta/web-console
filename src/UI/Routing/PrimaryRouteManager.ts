import { generatePath, matchPath, PathMatch, useLocation } from "react-router";
import {
  RouteManager,
  Route,
  RouteFactory,
  RouteKind,
  RouteParams,
  RouteMatch,
  Crumb,
  RouteKindWithId,
} from "@/Core";

/**
 * Builds the route table from the routes the app registers.
 * Only these routes exist: a kind of a feature that is not part of the app is not registered.
 *
 * @param baseUrl the base url every route path is prefixed with
 * @param routes the routes the app registers
 * @throws when two routes are registered with the same kind
 */
export function PrimaryRouteManager(baseUrl: string, routes: RouteFactory[]): RouteManager {
  // A kind is missing when the feature that declares it is not part of the app.
  const routeDictionary: Partial<Record<RouteKind, Route>> = {};

  routes.forEach((createRoute) => {
    const route = createRoute(baseUrl);

    if (routeDictionary[route.kind] !== undefined) {
      throw new Error(`Route "${route.kind}" is registered more than once.`);
    }

    routeDictionary[route.kind] = route;
  });

  function isBaseUrlDefined(): boolean {
    return baseUrl !== "";
  }

  function has(kind: RouteKind): boolean {
    return routeDictionary[kind] !== undefined;
  }

  function getLineageFromRoute(route: Route, routes: Route[] = []): Route[] {
    if (route.parent && has(route.parent)) {
      return getLineageFromRoute(getRoute(route.parent), [route, ...routes]);
    }

    return [route, ...routes];
  }
  function getRelatedUrlWithoutParams(pathname: string): string {
    const routeMatch = getRouteMatchFromUrl(pathname);

    if (typeof routeMatch === "undefined") {
      return getUrl("Dashboard", undefined);
    }

    const { route } = routeMatch;

    if (!routeHasParams(route)) {
      return pathname;
    }

    const parent = getParentWithoutParams(route);

    if (typeof parent === "undefined") {
      return getUrl("Dashboard", undefined);
    }

    return getUrl(parent.kind, undefined);
  }

  function getParentWithoutParams(route: Route): Route | undefined {
    const lineage = getLineageFromRoute(route);

    return lineage.reverse().find((route) => !routeHasParams(route));
  }

  function routeHasParams(route: Route): boolean {
    return route.path.includes(":");
  }

  function getRoutes(): Route[] {
    return Object.values(routeDictionary).filter((route) => route !== undefined);
  }

  function getRoute<K extends RouteKind>(kind: K): Route<K> {
    const route = routeDictionary[kind];

    if (route === undefined) {
      throw new Error(`Route "${kind}" is not registered.`);
    }

    return route as Route<K>;
  }

  function getUrl<K extends RouteKind>(kind: K, params: RouteParams<K>): string {
    const route = getRoute(kind);

    // generatePath already encodeURIComponent's each param; encoding them here too would
    // double-encode values with special characters (e.g. "Parent 1" -> "Parent%2520" instead
    // of "Parent%20").
    return generatePath(route.path, params);
  }

  function getUrlForApiUri(uri: string): string | undefined {
    if (uri.length <= 0 || !has("CompileDetails")) {
      return undefined;
    }

    const pattern = "/api/v2/compilereport/:id";
    const match = matchPath(pattern, uri);

    if (match === null) {
      return undefined;
    }

    if (match.params.id === undefined) {
      return undefined;
    }

    return getUrl("CompileDetails", { id: match.params.id });
  }

  function getParamsFromUrl(uri: string): RouteKindWithId<"CompileDetails"> | undefined {
    if (uri.length <= 0 || !has("CompileDetails")) {
      return undefined;
    }

    const pattern = "/api/v2/compilereport/:id";
    const match = matchPath(pattern, uri);

    if (match === null) {
      return undefined;
    }

    if (match.params.id === undefined) {
      return undefined;
    }

    const params = { id: match.params.id };

    return {
      kind: "CompileDetails",
      params,
    };
  }

  function getRouteMatchFromUrl(url: string): RouteMatch | undefined {
    const routeMatchPairs = getRoutes().map((route) => [route, matchPath(route.path, url)]);
    const routeWithMatch = routeMatchPairs.find(
      (pair): pair is [Route, PathMatch] => pair[1] !== null
    );

    if (typeof routeWithMatch === "undefined") {
      return undefined;
    }

    const [route, match] = routeWithMatch;

    return {
      route,
      params:
        Object.entries(match.params).length <= 0
          ? undefined
          : (match.params as RouteParams<typeof route.kind>),
    };
  }

  function useUrl(kind: RouteKind, params: RouteParams<RouteKind>): string {
    const { search } = useLocation();
    const route = getRoute(kind);
    const path = generatePath(route.path, params);

    return `${path}${search}`;
  }

  function getCrumbs(url: string): Crumb[] {
    const routeMatch = getRouteMatchFromUrl(url);

    if (typeof routeMatch === "undefined") {
      return [];
    }

    const { route, params } = routeMatch;
    const lineage = getLineageFromRoute(route);

    return lineage.map(({ kind, generateLabel, path }, idx) => ({
      kind,
      label: generateLabel(params),
      url: generatePath(path, params),
      active: idx === lineage.length - 1,
    }));
  }

  return {
    isBaseUrlDefined,
    has,
    getRoutes,
    getRoute,
    getUrl,
    getUrlForApiUri,
    getRelatedUrlWithoutParams,
    getLineageFromRoute,
    getRouteMatchFromUrl,
    useUrl,
    getCrumbs,
    getParamsFromUrl,
  };
}
