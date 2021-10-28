import { getRouteWithParamsFromUrl } from "@/UI/Routing/Utils";
import { Kind } from "@/UI/Routing/Kind";
import React, { useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { SearchSanitizer } from "./SearchSanitizer";
import { DependencyContext } from "@/UI/Dependency";
import { Route } from "@/Core";

export const Provider: React.FC = ({ children }) => {
  const { routeManager } = useContext(DependencyContext);
  const { pathname, search, hash } = useLocation();
  const history = useHistory();
  const sanitizer = new SearchSanitizer(routeManager);

  const [sanitizedSearch, routeKind] = getSearchResult(
    sanitizer,
    routeManager.getRoutes(),
    pathname,
    search
  );

  useEffect(() => {
    if (sanitizedSearch !== null && sanitizedSearch !== search) {
      history.replace(`${pathname}${sanitizedSearch}${hash}`);
    }
  }, [history, hash, pathname, sanitizedSearch, search]);

  if (routeKind !== null) {
    return sanitizer.isSanitized(routeKind, search) ? <>{children}</> : null;
  }
  return <>{children}</>;
};

const getSearchResult = (
  sanitizer: SearchSanitizer,
  routes: Route[],
  pathname: string,
  search: string
): [string | null, Kind | null] => {
  const match = getRouteWithParamsFromUrl(routes, pathname);
  if (typeof match === "undefined") return [null, null];
  const [route] = match;
  return [sanitizer.sanitize(route.kind, search), route.kind];
};
