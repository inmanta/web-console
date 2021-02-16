import { createContext } from "react";
import { DataProvider } from "@/Core";
import { DummyDataProvider } from "@/Test";

export interface Services {
  dataManager: DataProvider;
}

export const ServicesContext = createContext<Services>({
  dataManager: new DummyDataProvider(),
});
