import React from "react";
import { StoreProvider } from "easy-peasy";
import { SubscriptionComponent } from "./SubscriptionComponent";
import { getStoreInstance } from "./Store";
import { ServicesContext } from "./ServicesContext";
import { DataManagerImpl } from "./DataManagerImpl";
import { StateHelperImpl } from "./StateHelperImpl";
import { SubscriptionHelperImpl } from "./SubscriptionHelperImpl";
import { ApiHelperImpl } from "./ApiHelperImpl";
import { IntervalsDictionary } from "./IntervalsDictionary";

export default {
  title: "SubscriptionComponent",
  component: SubscriptionComponent,
};

const storeInstance = getStoreInstance();

const services = {
  dataManager: new DataManagerImpl(
    new StateHelperImpl(storeInstance),
    new SubscriptionHelperImpl(
      2000,
      new ApiHelperImpl(),
      new IntervalsDictionary()
    )
  ),
};

export const Default: React.FC = () => (
  <ServicesContext.Provider value={services}>
    <StoreProvider store={storeInstance}>
      <SubscriptionComponent id="a1b2c3" />
    </StoreProvider>
  </ServicesContext.Provider>
);
