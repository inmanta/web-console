import React, { createContext } from "react";
import { CommandProvider, DataProvider } from "@/Core";
import { DummyCommandProvider } from "./DummyCommandProvider";
import { DummyDataProvider } from "./DummyDataProvider";

export interface Dependencies {
  commandProvider: CommandProvider;
  dataProvider: DataProvider;
}

export const DependencyContext = createContext<Dependencies>({
  commandProvider: new DummyCommandProvider(),
  dataProvider: new DummyDataProvider(),
});

export const DependencyProvider: React.FC<{
  dependencies: Partial<Dependencies>;
}> = ({ dependencies: { commandProvider, dataProvider }, children }) => (
  <DependencyContext.Provider
    value={{
      commandProvider: commandProvider || new DummyCommandProvider(),
      dataProvider: dataProvider || new DummyDataProvider(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
