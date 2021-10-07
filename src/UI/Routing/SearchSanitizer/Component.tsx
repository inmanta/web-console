import { getRouteWithParamsFromUrl } from "@/UI/Routing/Utils";
import { Kind } from "@/UI/Routing/Kind";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { PageStateSanitizer } from "../PageStateSanitizer";
import { SearchSanitizer } from "./SearchSanitizer";

const sanitizer = new SearchSanitizer(new PageStateSanitizer());

export const Component: React.FC = ({ children }) => {
  const { pathname, search, hash } = useLocation();
  const history = useHistory();

  const result = getSearchResult(pathname, search);
  useEffect(() => {
    if (result !== null) {
      history.replace(`${pathname}${result[0]}${hash}`);
    }
  }, [result !== null ? result[0] : null]);

  if (result !== null) {
    const [, kind] = result;
    return sanitizer.isSanitized(kind, search) ? <>{children}</> : null;
  }
  return <>{children}</>;
};

const getSearchResult = (
  pathname: string,
  search: string
): [string, Kind] | null => {
  const match = getRouteWithParamsFromUrl(pathname);
  if (typeof match === "undefined") return null;
  const [route] = match;
  return [sanitizer.sanitize(route.kind, search), route.kind];
};
