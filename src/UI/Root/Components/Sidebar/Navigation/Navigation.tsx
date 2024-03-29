import React, { useContext } from "react";
import { Nav, NavGroup } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import {
  envrionment,
  lifecycleServiceManager,
  orchestrationEngine,
  resourceManager,
} from "./Group";
import { NavigationItem } from "./NavigationItem";

/**
 * Navigation component
 * @param {environment} - string | undefined
 *
 * @returns {React.FC} - Navigation component
 */
export const Navigation: React.FC<{ environment: string | undefined }> = ({
  environment,
}) => {
  const { featureManager, routeManager } = useContext(DependencyContext);
  const isEnvPresent = typeof environment !== "undefined";
  const groups = [
    envrionment(routeManager, isEnvPresent),
    ...(featureManager.isLsmEnabled()
      ? [lifecycleServiceManager(routeManager, isEnvPresent, featureManager)]
      : []),
    orchestrationEngine(routeManager, isEnvPresent),
    resourceManager(routeManager, isEnvPresent, featureManager),
  ];

  return (
    <Nav theme="dark">
      {groups.map(({ id, title, links }) => (
        <NavGroup title={title} key={id}>
          {links.map(NavigationItem)}
        </NavGroup>
      ))}
    </Nav>
  );
};
