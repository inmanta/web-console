import React, { createContext } from "react";
import {
  CommandResolver,
  FileFetcher,
  QueryResolver,
  UrlManager,
  EnvironmentModifier,
  StatusManager,
  RouteManager,
  EnvironmentHandler,
  AuthHelper,
} from "@/Core";
import {
  DummyCommandResolver,
  DummyEnvironmentModifier,
  DummyStatusManager,
  DummyFileFetcher,
  DummyQueryResolver,
  DummyUrlManager,
  DummyRouteManager,
  DummyEnvironmentHandler,
  DummyAuthHelper,
} from "./Dummy";

export interface Dependencies {
  commandResolver: CommandResolver;
  queryResolver: QueryResolver;
  urlManager: UrlManager;
  fileFetcher: FileFetcher;
  environmentModifier: EnvironmentModifier;
  statusManager: StatusManager;
  routeManager: RouteManager;
  environmentHandler: EnvironmentHandler;
  authHelper: AuthHelper;
}

export const DependencyContext = createContext<Dependencies>({
  commandResolver: new DummyCommandResolver(),
  queryResolver: new DummyQueryResolver(),
  urlManager: new DummyUrlManager(),
  fileFetcher: new DummyFileFetcher(),
  environmentModifier: new DummyEnvironmentModifier(),
  statusManager: new DummyStatusManager(),
  routeManager: new DummyRouteManager(),
  environmentHandler: new DummyEnvironmentHandler(),
  authHelper: new DummyAuthHelper(),
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
    statusManager,
    routeManager,
    environmentHandler,
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
      statusManager: statusManager || new DummyStatusManager(),
      routeManager: routeManager || new DummyRouteManager(),
      environmentHandler: environmentHandler || new DummyEnvironmentHandler(),
      authHelper: authHelper || new DummyAuthHelper(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
