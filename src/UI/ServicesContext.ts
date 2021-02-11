import { createContext } from "react";
import { DataManager, ResourceModel, Subject } from "@/Core";
import { DummyDataManager } from "@/Test";

export interface Services {
  dataManager: DataManager<Subject, string, ResourceModel[]>;
}

export const ServicesContext = createContext<Services>({
  dataManager: new DummyDataManager(),
});
