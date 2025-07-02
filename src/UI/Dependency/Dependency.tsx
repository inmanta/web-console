import React, { createContext } from "react";
import {
  UrlManager,
  RouteManager,
  EnvironmentHandler,
  OrchestratorProvider,
  ArchiveHelper,
} from "@/Core";
import { AuthContextInterface, defaultAuthContext } from "@/Data/Auth/AuthContext";
import {
  DummyOrchestratorProvider,
  DummyUrlManager,
  DummyRouteManager,
  DummyEnvironmentHandler,
  DummyArchiveHelper,
} from "./Dummy";

export interface Dependencies {
  urlManager: UrlManager;
  orchestratorProvider: OrchestratorProvider;
  routeManager: RouteManager;
  environmentHandler: EnvironmentHandler;
  archiveHelper: ArchiveHelper;
  authHelper: AuthContextInterface;
}

export const DependencyContext = createContext<Dependencies>({
  urlManager: new DummyUrlManager(),
  orchestratorProvider: new DummyOrchestratorProvider(),
  routeManager: new DummyRouteManager(),
  environmentHandler: DummyEnvironmentHandler(),
  archiveHelper: new DummyArchiveHelper(),
  authHelper: defaultAuthContext,
});

export const DependencyProvider: React.FC<{
  dependencies: Partial<Dependencies>;
  children?: React.ReactNode;
}> = ({
  dependencies: {
    urlManager,
    orchestratorProvider,
    routeManager,
    environmentHandler,
    archiveHelper,
    authHelper,
  },
  children,
}) => (
  <DependencyContext.Provider
    value={{
      urlManager: urlManager || new DummyUrlManager(),
      orchestratorProvider: orchestratorProvider || new DummyOrchestratorProvider(),
      routeManager: routeManager || new DummyRouteManager(),
      environmentHandler: environmentHandler || DummyEnvironmentHandler(),
      archiveHelper: archiveHelper || new DummyArchiveHelper(),
      authHelper: authHelper || defaultAuthContext,
    }}
  >
    {children}
  </DependencyContext.Provider>
);
