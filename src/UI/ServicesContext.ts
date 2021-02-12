import { createContext } from "react";
import { DataManager } from "@/Core";
import { DummyDataManager } from "@/Test";

export interface Services {
  dataManager: DataManager;
}

export const ServicesContext = createContext<Services>({
  dataManager: new DummyDataManager(),
});
