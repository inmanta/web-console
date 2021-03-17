import React from "react";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/UI/Store";
import {
  StaticSubscriptionController,
  Outcome,
  InstantFetcher,
  Resources,
} from "@/Test";
import { ServicesContext } from "@/UI/ServicesContext";
import {
  DataProviderImpl,
  ResourcesStateHelper,
  DataManagerImpl,
  ResourcesHookHelper,
} from "@/UI/Data";
import { ResourcesView } from "./ResourcesView";
import { identity } from "lodash";

export default {
  title: "ResourcesView",
  component: ResourcesView,
};

const Template: React.FC<{ outcome: Outcome<"Resources"> }> = ({ outcome }) => {
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl([
    new ResourcesHookHelper(
      new DataManagerImpl<"Resources">(
        new InstantFetcher<"Resources">(outcome),
        new ResourcesStateHelper(store),
        identity
      ),
      new StaticSubscriptionController()
    ),
  ]);

  const instance = {
    id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
    service_entity: "vlan-assignment",
    version: 4,
    environment: "34a961ba-db3c-486e-8d85-1438d8e88909",
  };

  return (
    <ServicesContext.Provider value={{ dataProvider }}>
      <StoreProvider store={store}>
        <ResourcesView qualifier={instance} title="" icon={<></>} />
      </StoreProvider>
    </ServicesContext.Provider>
  );
};

export const Loading: React.FC = () => (
  <Template outcome={{ kind: "Loading" }} />
);

export const Empty: React.FC = () => (
  <Template outcome={{ kind: "Success", data: { data: [] } }} />
);
export const Failed: React.FC = () => (
  <Template outcome={{ kind: "Failed", error: "error" }} />
);

export const Success: React.FC = () => (
  <Template outcome={{ kind: "Success", data: { data: Resources.A } }} />
);
