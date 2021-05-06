import React, { createContext } from "react";
import { CommandProvider, DataProvider, UrlManager } from "@/Core";
import { DummyCommandProvider } from "./DummyCommandProvider";
import { DummyDataProvider } from "./DummyDataProvider";
import { DummyUrlManager } from "./DummyUrlManager";

export interface Dependencies {
  commandProvider: CommandProvider;
  dataProvider: DataProvider;
  urlManager: UrlManager;
}

export const DependencyContext = createContext<Dependencies>({
  commandProvider: new DummyCommandProvider(),
  dataProvider: new DummyDataProvider(),
  urlManager: new DummyUrlManager(),
});

export const DependencyProvider: React.FC<{
  dependencies: Partial<Dependencies>;
}> = ({
  dependencies: { commandProvider, dataProvider, urlManager },
  children,
}) => (
  <DependencyContext.Provider
    value={{
      commandProvider: commandProvider || new DummyCommandProvider(),
      dataProvider: dataProvider || new DummyDataProvider(),
      urlManager: urlManager || new DummyUrlManager(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
