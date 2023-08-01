import React, { useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { RouteManager, RouteKind } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { SearchSanitizer } from "./SearchSanitizer";

export const Provider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { routeManager } = useContext(DependencyContext);
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const sanitizer = new SearchSanitizer(routeManager);

  const [sanitizedSearch, routeKind] = getSearchResult(
    sanitizer,
    routeManager,
    pathname,
    search,
  );

  useEffect(() => {
    if (sanitizedSearch !== null && sanitizedSearch !== search) {
      navigate(`${pathname}${sanitizedSearch}${hash}`, { replace: true });
    }
  }, [navigate, hash, pathname, sanitizedSearch, search]);

  if (routeKind !== null) {
    return sanitizer.isSanitized(routeKind, search) ? <>{children}</> : null;
  }
  return <>{children}</>;
};

const getSearchResult = (
  sanitizer: SearchSanitizer,
  routeManager: RouteManager,
  pathname: string,
  search: string,
): [string | null, RouteKind | null] => {
  const match = routeManager.getRouteMatchFromUrl(pathname);
  if (typeof match === "undefined") return [null, null];
  return [sanitizer.sanitize(match.route.kind, search), match.route.kind];
};
