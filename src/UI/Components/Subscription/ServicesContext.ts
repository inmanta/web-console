import { HookedDataManagerImpl } from "./HookedDataManagerImpl";
import { createContext } from "react";
import { HookedDataManager } from "./Interfaces";
import { ApiHelperImpl } from "./ApiHelperImpl";
import { StateHelperImpl } from "./StateHelperImpl";
import { storeInstance } from "./Store";
import { SubscriptionHelperImpl } from "./SubscriptionHelperImpl";
import { IntervalsDictionary } from "./IntervalsDictionary";

export interface ServicesBundle {
  dataManager: HookedDataManager;
}

export const ServicesContext = createContext<ServicesBundle>({
  dataManager: new HookedDataManagerImpl(
    new StateHelperImpl(storeInstance),
    new SubscriptionHelperImpl(
      2000,
      new ApiHelperImpl(),
      new IntervalsDictionary()
    )
  ),
});
