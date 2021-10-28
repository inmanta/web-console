import { useContext, useEffect } from "react";
import { matchPath, match } from "react-router-dom";
import { useHistory, useLocation } from "react-router";
import { Route, RouteManager, RouteParams } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { Kind } from "./Kind";

export const getLineageFromRoute = (
  routeManager: RouteManager,
  route: Route,
  routes: Route[] = []
): Route[] => {
  if (route.parent) {
    return getLineageFromRoute(
      routeManager,
      routeManager.getRoute(route.parent),
      [route, ...routes]
    );
  }
  return [route, ...routes];
};

type MatchedParams = Record<string, string>;

export function getRouteWithParamsFromUrl(
  routes: Route[],
  url: string
): [Route, MatchedParams] | undefined {
  const routeMatchPairs = routes.map((route) => [
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

type NavigateTo = (
  kind: Kind,
  params: RouteParams<typeof kind>,
  search?: string
) => void;

/**
 * The useNavigateTo hook returns a navigateTo function which navigates to a route.
 */
export const useNavigateTo = (): NavigateTo => {
  const { routeManager } = useContext(DependencyContext);
  const { search } = useLocation();
  const history = useHistory();

  return (routeKind, params, newSearch) => {
    const pathname = routeManager.getUrl(routeKind, params);
    history.push(`${pathname}?${newSearch || search}`);
  };
};

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
