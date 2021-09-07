import React, { createContext } from "react";
import {
  CommandResolver,
  FileFetcher,
  QueryResolver,
  UrlManager,
  EnvironmentModifier,
} from "@/Core";
import {
  DummyCommandResolver,
  DummyEnvironmentModifier,
  DummyFileFetcher,
  DummyQueryResolver,
  DummyUrlManager,
} from "./Dummy";

export interface Dependencies {
  commandResolver: CommandResolver;
  queryResolver: QueryResolver;
  urlManager: UrlManager;
  fileFetcher: FileFetcher;
  environmentModifier: EnvironmentModifier;
}

export const DependencyContext = createContext<Dependencies>({
  commandResolver: new DummyCommandResolver(),
  queryResolver: new DummyQueryResolver(),
  urlManager: new DummyUrlManager(),
  fileFetcher: new DummyFileFetcher(),
  environmentModifier: new DummyEnvironmentModifier(),
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
    }}
  >
    {children}
  </DependencyContext.Provider>
);
