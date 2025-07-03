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
export const Navigation: React.FC<{ environment: string | undefined }> = ({ environment }) => {
  const { orchestratorProvider, routeManager } = useContext(DependencyContext);

  const isEnvPresent = typeof environment !== "undefined";
  const groups = [
    envrionment(routeManager, isEnvPresent),
    ...(orchestratorProvider.isLsmEnabled()
      ? [lifecycleServiceManager(routeManager, isEnvPresent, orchestratorProvider)]
      : []),
    orchestrationEngine(routeManager, isEnvPresent),
    resourceManager(routeManager, isEnvPresent, orchestratorProvider),
  ];

  return (
    <Nav>
      {groups.map(({ id, title, links }) => (
        <NavGroup title={title} key={id}>
          {links.map((link) => (
            <NavigationItem key={link.id} {...link} />
          ))}
        </NavGroup>
      ))}
    </Nav>
  );
};
