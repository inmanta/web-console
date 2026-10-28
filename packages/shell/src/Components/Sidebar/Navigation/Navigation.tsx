import React, { useContext } from "react";
import { useLocation } from "react-router";
import { Nav, NavGroup } from "@patternfly/react-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { ShellOptionsContext } from "@inmanta/web-console-shell/ShellOptions";
import { getGroups } from "./Group";
import { NavigationItem } from "./NavigationItem";

/**
 * Navigation component
 * @param {environment} - string | undefined
 *
 * @returns {React.FC} - Navigation component
 */
export const Navigation: React.FC<{ environment: string | undefined }> = ({ environment }) => {
  const { orchestratorProvider, routeManager, features } = useContext(DependencyContext);
  const { sidebar } = useContext(ShellOptionsContext);
  const { pathname } = useLocation();

  const isEnvPresent = typeof environment !== "undefined";
  const groups = getGroups(features, routeManager, orchestratorProvider, isEnvPresent, sidebar);

  // Helper function to check if a navigation item is active
  const isNavigationItemActive = (url: string): boolean => {
    // Remove query parameters and hash from current pathname for comparison
    const currentPath = pathname.split("?")[0].split("#")[0];
    const navPath = url.split("?")[0].split("#")[0];

    // Check if current path contains the navigation URL
    return currentPath.includes(navPath) && navPath !== "";
  };

  return (
    <Nav>
      {groups.map(({ id, title, links }) => (
        <NavGroup title={title} key={id}>
          {links.map((link) => (
            <NavigationItem key={link.id} {...link} isActive={isNavigationItemActive(link.url)} />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
};
