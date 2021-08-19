import React, { createContext } from "react";
import {
  CommandResolver,
  FileFetcher,
  QueryResolver,
  UrlManager,
} from "@/Core";
import {
  DummyCommandResolver,
  DummyFileFetcher,
  DummyQueryResolver,
  DummyUrlManager,
} from "./Dummy";

export interface Dependencies {
  commandResolver: CommandResolver;
  queryResolver: QueryResolver;
  urlManager: UrlManager;
  fileFetcher: FileFetcher;
}

export const DependencyContext = createContext<Dependencies>({
  commandResolver: new DummyCommandResolver(),
  queryResolver: new DummyQueryResolver(),
  urlManager: new DummyUrlManager(),
  fileFetcher: new DummyFileFetcher(),
});

export const DependencyProvider: React.FC<{
  dependencies: Partial<Dependencies>;
}> = ({
  dependencies: { commandResolver, queryResolver, urlManager, fileFetcher },
  children,
}) => (
  <DependencyContext.Provider
    value={{
      commandResolver: commandResolver || new DummyCommandResolver(),
      queryResolver: queryResolver || new DummyQueryResolver(),
      urlManager: urlManager || new DummyUrlManager(),
      fileFetcher: fileFetcher || new DummyFileFetcher(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
