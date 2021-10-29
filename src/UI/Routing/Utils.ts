import { useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { RouteParams } from "@/Core";
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
