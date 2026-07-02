import { useContext, useEffect } from "react";
import { useNavigate, useLocation, useParams, Params, NavigateOptions } from "react-router";
import { RouteKind, RouteParams } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

type NavigateTo = (
  kind: RouteKind,
  params: RouteParams<typeof kind>,
  newSearch?: string,
  options?: NavigateOptions
) => void;

/**
 * The useNavigateTo hook returns a navigateTo function which navigates to a route.
 * @param kind The route to navigate to.
 * @param params The route parameters for that route.
 * @param newSearch The query string to use; must start with a question mark "?". When omitted, the
 *   current location's search is preserved.
 * @param options React Router's `NavigateOptions` (e.g. `{ replace: true }` to replace the current
 *   history entry instead of pushing a new one — useful for redirects).
 * @throws Will throw an error when newSearch is invalid
 */
export const useNavigateTo = (): NavigateTo => {
  const { routeManager } = useContext(DependencyContext);
  const { search } = useLocation();
  const navigate = useNavigate();

  return (routeKind, params, newSearch, options) => {
    if (newSearch !== undefined) {
      validateSearch(newSearch);
    }

    const pathname = routeManager.getUrl(routeKind, params);

    navigate(`${pathname}${newSearch || search}`, options);
  };
};

const validateSearch = (search: string): void => {
  if (search.startsWith("?")) {
    return;
  }

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

const decodeParams = (params: Params): Params =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      value === undefined ? value : decodeURIComponent(value),
    ])
  );

export const encodeParams = (params: Params): Params =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      value === undefined ? value : encodeURIComponent(value),
    ])
  );
