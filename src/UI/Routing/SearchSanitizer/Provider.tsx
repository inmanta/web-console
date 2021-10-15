import { getRouteWithParamsFromUrl } from "@/UI/Routing/Utils";
import { Kind } from "@/UI/Routing/Kind";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { SearchSanitizer } from "./SearchSanitizer";

const sanitizer = new SearchSanitizer();

export const Provider: React.FC = ({ children }) => {
  const { pathname, search, hash } = useLocation();
  const history = useHistory();

  const [sanitizedSearch, routeKind] = getSearchResult(pathname, search);

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
  pathname: string,
  search: string
): [string | null, Kind | null] => {
  const match = getRouteWithParamsFromUrl(pathname);
  if (typeof match === "undefined") return [null, null];
  const [route] = match;
  return [sanitizer.sanitize(route.kind, search), route.kind];
};
