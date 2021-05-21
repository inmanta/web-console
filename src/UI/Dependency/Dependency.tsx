import React, { createContext } from "react";
import { CommandProvider, QueryResolver, UrlManager } from "@/Core";
import { DummyCommandProvider } from "./DummyCommandProvider";
import { DummyQueryResolver } from "./DummyQueryResolver";
import { DummyUrlManager } from "./DummyUrlManager";

export interface Dependencies {
  commandProvider: CommandProvider;
  queryResolver: QueryResolver;
  urlManager: UrlManager;
}

export const DependencyContext = createContext<Dependencies>({
  commandProvider: new DummyCommandProvider(),
  queryResolver: new DummyQueryResolver(),
  urlManager: new DummyUrlManager(),
});

export const DependencyProvider: React.FC<{
  dependencies: Partial<Dependencies>;
}> = ({
  dependencies: { commandProvider, queryResolver, urlManager },
  children,
}) => (
  <DependencyContext.Provider
    value={{
      commandProvider: commandProvider || new DummyCommandProvider(),
      queryResolver: queryResolver || new DummyQueryResolver(),
      urlManager: urlManager || new DummyUrlManager(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
