import { useContext, useEffect } from "react";
import { useNavigate, useLocation, useParams, Params } from "react-router-dom";
import { mapValues } from "lodash-es";
import { RouteKind, RouteParams } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

type NavigateTo = (
  kind: RouteKind,
  params: RouteParams<typeof kind>,
  search?: string,
) => void;

/**
 * The useNavigateTo hook returns a navigateTo function which navigates to a route.
 * @param newSearch This string should start with a question mark "?".
 * @throws Will throw an error when newSearch is invalid
 */
export const useNavigateTo = (): NavigateTo => {
  const { routeManager } = useContext(DependencyContext);
  const { search } = useLocation();
  const navigate = useNavigate();

  return (routeKind, params, newSearch) => {
    if (newSearch !== undefined) validateSearch(newSearch);
    const pathname = routeManager.getUrl(routeKind, params);
    navigate(`${pathname}${newSearch || search}`);
  };
};

const validateSearch = (search: string): void => {
  if (search.startsWith("?")) return;
  throw new Error("A search string should start with a question mark (?).");
};

/**
 * @NOTE useRouteParams decodes the parameter values before returning them.
 */
export const useRouteParams = <R extends RouteKind>(): RouteParams<R> => {
  const params = useParams();
  return decodeParams(params) as RouteParams<R>;
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

export const decodeParams = (params: Params): Params => {
  return mapValues(params, (value) =>
    value === undefined ? value : decodeURIComponent(value),
  );
};

export const encodeParams = (params: Params): Params => {
  return mapValues(params, (value) =>
    value === undefined ? value : encodeURIComponent(value),
  );
};
