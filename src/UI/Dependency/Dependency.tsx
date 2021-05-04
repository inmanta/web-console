import React, { createContext } from "react";
import { CommandProvider, DataProvider, UrlController } from "@/Core";
import { DummyCommandProvider } from "./DummyCommandProvider";
import { DummyDataProvider } from "./DummyDataProvider";
import { DummyUrlController } from "./DummyUrlController";

export interface Dependencies {
  commandProvider: CommandProvider;
  dataProvider: DataProvider;
  urlController: UrlController;
}

export const DependencyContext = createContext<Dependencies>({
  commandProvider: new DummyCommandProvider(),
  dataProvider: new DummyDataProvider(),
  urlController: new DummyUrlController(),
});

export const DependencyProvider: React.FC<{
  dependencies: Partial<Dependencies>;
}> = ({
  dependencies: { commandProvider, dataProvider, urlController },
  children,
}) => (
  <DependencyContext.Provider
    value={{
      commandProvider: commandProvider || new DummyCommandProvider(),
      dataProvider: dataProvider || new DummyDataProvider(),
      urlController: urlController || new DummyUrlController(),
    }}
  >
    {children}
  </DependencyContext.Provider>
);
