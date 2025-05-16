import React, { createContext } from "react";
import {
  UrlManager,
  EnvironmentModifier,
  RouteManager,
  EnvironmentHandler,
  FeatureManager,
  ArchiveHelper,
} from "@/Core";
import { AuthContextInterface, defaultAuthContext } from "@/Data/Auth/AuthContext";
import {
  DummyEnvironmentModifier,
  DummyFeatureManager,
  DummyUrlManager,
  DummyRouteManager,
  DummyEnvironmentHandler,
  DummyArchiveHelper,
} from "./Dummy";

export interface Dependencies {
  urlManager: UrlManager;
  environmentModifier: EnvironmentModifier;
  featureManager: FeatureManager;
  routeManager: RouteManager;
  environmentHandler: EnvironmentHandler;
  archiveHelper: ArchiveHelper;
  authHelper: AuthContextInterface;
}

export const DependencyContext = createContext<Dependencies>({
  urlManager: new DummyUrlManager(),
  environmentModifier: new DummyEnvironmentModifier(),
  featureManager: new DummyFeatureManager(),
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
    environmentModifier,
    featureManager,
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
      environmentModifier: environmentModifier || new DummyEnvironmentModifier(),
      featureManager: featureManager || new DummyFeatureManager(),
      routeManager: routeManager || new DummyRouteManager(),
      environmentHandler: environmentHandler || DummyEnvironmentHandler(),
      archiveHelper: archiveHelper || new DummyArchiveHelper(),
      authHelper: authHelper || defaultAuthContext,
    }}
  >
    {children}
  </DependencyContext.Provider>
);
