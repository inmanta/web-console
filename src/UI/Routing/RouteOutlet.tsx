import { useContext, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { DependencyContext } from "@/UI/Dependency";
import { Initializer } from "@/UI/Root/Components/Initializer";

/**
 * Renders a component that checks if the user is authenticated before rendering the child components.
 * If the user is not authenticated, it triggers login flow.
 *
 * @returns The rendered private route component.
 */
export const RouteOutlet = () => {
  const { authHelper } = useContext(DependencyContext);
  const { pathname } = useLocation();

  useEffect(() => {
    //instead of navigating to login page, we trigger login flow which can vary based on the auth provider
    if (!authHelper.getToken()) {
      authHelper.login();
    }
  }, [authHelper]);

  useEffect(() => {
    // Page content lives in PatternFly's scrollable <main id="primary-app-container">,
    // which doesn't reset on its own when navigating between routes.
    document.getElementById("primary-app-container")?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Initializer>
      <Outlet />
    </Initializer>
  );
};
