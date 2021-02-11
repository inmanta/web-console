import { HookedDataManagerImpl } from "./HookedDataManagerImpl";
import { createContext } from "react";
import { HookedDataManager } from "./Interfaces";
import { ApiHelperImpl } from "./ApiHelperImpl";
import { StateHelperImpl } from "./StateHelperImpl";
import { getStoreInstance } from "./Store";
import { SubscriptionHelperImpl } from "./SubscriptionHelperImpl";
import { IntervalsDictionary } from "./IntervalsDictionary";

export interface Services {
  dataManager: HookedDataManager;
}

export const ServicesContext = createContext<Services>({
  dataManager: new HookedDataManagerImpl(
    new StateHelperImpl(getStoreInstance()),
    new SubscriptionHelperImpl(
      2000,
      new ApiHelperImpl(),
      new IntervalsDictionary()
    )
  ),
});
