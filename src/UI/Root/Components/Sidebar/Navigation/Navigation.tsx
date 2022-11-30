import React, { useContext } from "react";
import { Nav, NavGroup } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import {
  lifecycleServiceManager,
  orchestrationEngine,
  resourceManager,
} from "./Group";
import { NavigationItem } from "./NavigationItem";

export const Navigation: React.FC<{ environment: string | undefined }> = ({
  environment,
}) => {
  const { featureManager, routeManager } = useContext(DependencyContext);
  const isEnvPresent = typeof environment !== "undefined";
  const groups = [
    ...(featureManager.isLsmEnabled()
      ? [lifecycleServiceManager(routeManager, isEnvPresent)]
      : []),
    orchestrationEngine(routeManager, isEnvPresent),
    resourceManager(routeManager, isEnvPresent),
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
