import React, { useContext } from "react";
import { Outlet } from "react-router";
import { DependencyContext } from "@/UI/Dependency";
import { Initializer } from "../Root/Components/Initializer";

/**
 * Renders a component that checks if the user is authenticated before rendering the child components.
 * If the user is not authenticated, it triggers login flow.
 *
 * @returns The rendered private route component.
 */
export const RouteOutlet = () => {
  const { authHelper } = useContext(DependencyContext);

  //instead of navigating to login page, we trigger login flow which can vary based on the auth provider
  if (!authHelper.getToken()) {
    authHelper.login();
  }

  return (
    <Initializer>
      <Outlet />
    </Initializer>
  );
};
