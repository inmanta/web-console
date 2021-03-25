import React, { createContext } from "react";
import { CommandProvider, DataProvider } from "@/Core";
import { DummyCommandProvider, DummyDataProvider } from "@/Test";

export interface Dependencies {
  commandProvider: CommandProvider;
  dataProvider: DataProvider;
}

export const DependencyContext = createContext<Dependencies>({
  commandProvider: new DummyCommandProvider(),
  dataProvider: new DummyDataProvider(),
});

export const DependencyProvider: React.FC<{
  injections: Partial<Dependencies>;
}> = ({ injections: { commandProvider, dataProvider }, children }) => (
  <DependencyContext.Provider
    value={{
      commandProvider: commandProvider || new DummyCommandProvider(),
      dataProvider: dataProvider || new DummyDataProvider(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
