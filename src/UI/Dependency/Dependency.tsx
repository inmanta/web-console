import React, { createContext } from "react";
import {
  CommandResolver,
  FileFetcher,
  QueryResolver,
  UrlManager,
  EnvironmentModifier,
  FeatureManager,
  RouteManager,
  EnvironmentHandler,
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
}

export const DependencyContext = createContext<Dependencies>({
  commandResolver: new DummyCommandResolver(),
  queryResolver: new DummyQueryResolver(),
  urlManager: new DummyUrlManager(),
  fileFetcher: new DummyFileFetcher(),
  environmentModifier: new DummyEnvironmentModifier(),
  featureManager: new DummyFeatureManager(),
  routeManager: new DummyRouteManager(),
  environmentHandler: new DummyEnvironmentHandler(),
});

export const DependencyProvider: React.FC<{
  dependencies: Partial<Dependencies>;
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
      environmentHandler: environmentHandler || new DummyEnvironmentHandler(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
