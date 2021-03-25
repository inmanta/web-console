import { createContext } from "react";
import { DataProvider } from "@/Core";
import { DummyDataProvider } from "@/Test";

export interface Services {
  dataProvider: DataProvider;
}

export const ServicesContext = createContext<Services>({
  dataProvider: new DummyDataProvider(),
});
