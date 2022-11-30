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
  KeycloakController,
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
  DummyKeycloakController,
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
  keycloakController: KeycloakController;
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
  keycloakController: new DummyKeycloakController(),
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
    keycloakController,
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
      keycloakController: keycloakController || new DummyKeycloakController(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
