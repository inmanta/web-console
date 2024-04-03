import React, { createContext } from "react";
import {
  CommandResolver,
  FileFetcher,
  QueryResolver,
  UrlManager,
  EnvironmentModifier,
  RouteManager,
  EnvironmentHandler,
  AuthHelper,
  FeatureManager,
  ArchiveHelper,
  AuthController,
} from "@/Core";
import {
  DummyCommandResolver,
  DummyEnvironmentModifier,
  DummyFeatureManager,
  DummyFileFetcher,
  DummyQueryResolver,
  DummyUrlManager,
  DummyRouteManager,
  DummyEnvironmentHandler,
  DummyAuthHelper,
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
  authHelper: AuthHelper;
  archiveHelper: ArchiveHelper;
  authController: AuthController;
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
  authHelper: new DummyAuthHelper(),
  archiveHelper: new DummyArchiveHelper(),
  authController: new DummyAuthController(),
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
    authHelper,
    archiveHelper,
    authController,
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
      authHelper: authHelper || new DummyAuthHelper(),
      archiveHelper: archiveHelper || new DummyArchiveHelper(),
      authController: authController || new DummyAuthController(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
