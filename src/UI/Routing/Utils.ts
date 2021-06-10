import { useEffect } from "react";
import { matchPath, match, generatePath } from "react-router-dom";
import { Route, Kinds, Params, getRouteFromKind, allRoutes } from "./Route";

export const getLineageFromRoute = (
  route: Route,
  routes: Route[] = []
): Route[] => {
  if (route.parent) {
    return getLineageFromRoute(getRouteFromKind(route.parent), [
      route,
      ...routes,
    ]);
  }
  return [route, ...routes];
};

type MatchedParams = Record<string, string>;

export function getRouteWithParamsFromUrl(
  url: string
): [Route, MatchedParams] | undefined {
  const routeMatchPairs = allRoutes.map((route) => [
    route,
    matchPath<MatchedParams>(url, { path: route.path, exact: true }),
  ]);
  const routeWithMatch = routeMatchPairs.find(
    (pair): pair is [Route, match<MatchedParams>] => pair[1] !== null
  );
  if (typeof routeWithMatch === "undefined") return undefined;
  const [page, match] = routeWithMatch;
  return [page, match.params];
}

export function getUrl(kind: Kinds, params: Params<typeof kind>): string {
  const route = getRouteFromKind(kind);
  return generatePath(route.path, params);
}

/**
 * A custom hook for setting the page title
 * @param title
 */
export const useDocumentTitle = (title: string): void => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};
