import { useContext, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { RouteKind, RouteParams } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { Kind } from "./Kind";

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
  const navigate = useNavigate();

  return (routeKind, params, newSearch) => {
    const pathname = routeManager.getUrl(routeKind, params);
    navigate(`${pathname}?${newSearch || search}`);
  };
};

export const useRouteParams = <R extends RouteKind>(): RouteParams<R> => {
  const params = useParams();
  return params as RouteParams<R>;
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
