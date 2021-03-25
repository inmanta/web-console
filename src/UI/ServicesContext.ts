import { createContext } from "react";
import { CommandProvider, DataProvider } from "@/Core";
import { DummyDataProvider, DummyCommandProvider } from "@/Test";

export interface Services {
  dataProvider: DataProvider;
  commandProvider?: CommandProvider;
}

export const ServicesContext = createContext<Services>({
  dataProvider: new DummyDataProvider(),
  commandProvider: new DummyCommandProvider(),
});
