import { useContext } from "react";
import { useLocation } from "react-router";
import { RouteKind, RouteParams } from "@inmanta/web-console-core/Domain";
import { DependencyContext } from "./Dependency";

/**
 * Returns the url of a page with the current query string, like `routeManager.useUrl`, or
 * undefined when the app doesn't register its route, e.g. because the feature that owns the page
 * isn't part of the app. Use it to link to another feature's page.
 *
 * @param kind - the route of the page
 * @param params - the params of the route
 * @returns the url, or undefined when the route isn't registered
 */
export const useUrlIfRegistered = <K extends RouteKind>(
  kind: K,
  params: RouteParams<K>
): string | undefined => {
  const { routeManager } = useContext(DependencyContext);
  const { search } = useLocation();

  return routeManager.has(kind) ? `${routeManager.getUrl(kind, params)}${search}` : undefined;
};
