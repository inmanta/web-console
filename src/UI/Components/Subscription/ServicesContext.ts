import { DataManagerImpl } from "./DataManagerImpl";
import { createContext } from "react";
import { ApiHelperImpl } from "./ApiHelperImpl";
import { StateHelperImpl } from "./StateHelperImpl";
import { getStoreInstance } from "./Store";
import { SubscriptionHelperImpl } from "./SubscriptionHelperImpl";
import { IntervalsDictionary } from "./IntervalsDictionary";
import { DataManager } from "@/Core";
import { DataModel, Subject } from "./DataModel";

export interface Services {
  dataManager: DataManager<Subject, string, DataModel>;
}

export const ServicesContext = createContext<Services>({
  dataManager: new DataManagerImpl(
    new StateHelperImpl(getStoreInstance()),
    new SubscriptionHelperImpl(
      2000,
      new ApiHelperImpl(),
      new IntervalsDictionary()
    )
  ),
});
