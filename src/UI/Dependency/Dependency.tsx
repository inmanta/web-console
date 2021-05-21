import React, { createContext } from "react";
import { CommandResolver, QueryResolver, UrlManager } from "@/Core";
import { DummyCommandResolver } from "./DummyCommandResolver";
import { DummyQueryResolver } from "./DummyQueryResolver";
import { DummyUrlManager } from "./DummyUrlManager";

export interface Dependencies {
  commandResolver: CommandResolver;
  queryResolver: QueryResolver;
  urlManager: UrlManager;
}

export const DependencyContext = createContext<Dependencies>({
  commandResolver: new DummyCommandResolver(),
  queryResolver: new DummyQueryResolver(),
  urlManager: new DummyUrlManager(),
});

export const DependencyProvider: React.FC<{
  dependencies: Partial<Dependencies>;
}> = ({
  dependencies: { commandResolver, queryResolver, urlManager },
  children,
}) => (
  <DependencyContext.Provider
    value={{
      commandResolver: commandResolver || new DummyCommandResolver(),
      queryResolver: queryResolver || new DummyQueryResolver(),
      urlManager: urlManager || new DummyUrlManager(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
