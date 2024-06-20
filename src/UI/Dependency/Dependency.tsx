import React, { createContext } from "react";
import {
  CommandResolver,
  FileFetcher,
  QueryResolver,
  UrlManager,
  EnvironmentModifier,
  RouteManager,
  EnvironmentHandler,
  FeatureManager,
  ArchiveHelper,
  AuthController,
} from "@/Core";
import {
  AuthContextInterface,
  defaultAuthContext,
} from "@/Data/Auth/AuthContext";
import {
  DummyCommandResolver,
  DummyEnvironmentModifier,
  DummyFeatureManager,
  DummyFileFetcher,
  DummyQueryResolver,
  DummyUrlManager,
  DummyRouteManager,
  DummyEnvironmentHandler,
  DummyArchiveHelper,
  DummyAuthController,
} from "./Dummy";

export interface Dependencies {
  commandResolver: CommandResolver;
  queryResolver: QueryResolver;
  urlManager: UrlManager;
  fileFetcher: FileFetcher;
  environmentModifier: EnvironmentModifier;
  featureManager: FeatureManager;
  routeManager: RouteManager;
  environmentHandler: EnvironmentHandler;
  archiveHelper: ArchiveHelper;
  authController: AuthController;
  authHelper: AuthContextInterface;
}

export const DependencyContext = createContext<Dependencies>({
  commandResolver: new DummyCommandResolver(),
  queryResolver: new DummyQueryResolver(),
  urlManager: new DummyUrlManager(),
  fileFetcher: new DummyFileFetcher(),
  environmentModifier: new DummyEnvironmentModifier(),
  featureManager: new DummyFeatureManager(),
  routeManager: new DummyRouteManager(),
  environmentHandler: DummyEnvironmentHandler(),
  archiveHelper: new DummyArchiveHelper(),
  authController: new DummyAuthController(),
  authHelper: defaultAuthContext,
});

export const DependencyProvider: React.FC<{
  dependencies: Partial<Dependencies>;
  children?: React.ReactNode;
}> = ({
  dependencies: {
    commandResolver,
    queryResolver,
    urlManager,
    fileFetcher,
    environmentModifier,
    featureManager,
    routeManager,
    environmentHandler,
    archiveHelper,
    authController,
    authHelper,
  },
  children,
}) => (
  <DependencyContext.Provider
    value={{
      commandResolver: commandResolver || new DummyCommandResolver(),
      queryResolver: queryResolver || new DummyQueryResolver(),
      urlManager: urlManager || new DummyUrlManager(),
      fileFetcher: fileFetcher || new DummyFileFetcher(),
      environmentModifier:
        environmentModifier || new DummyEnvironmentModifier(),
      featureManager: featureManager || new DummyFeatureManager(),
      routeManager: routeManager || new DummyRouteManager(),
      environmentHandler: environmentHandler || DummyEnvironmentHandler(),
      archiveHelper: archiveHelper || new DummyArchiveHelper(),
      authController: authController || new DummyAuthController(),
      authHelper: authHelper || defaultAuthContext,
    }}
  >
    {children}
  </DependencyContext.Provider>
);
