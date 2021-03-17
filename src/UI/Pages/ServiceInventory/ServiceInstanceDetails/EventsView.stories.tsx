import React from "react";
import {
  ignoredErrorNormalEvents,
  instanceEvents,
  InstantFetcher,
  Outcome,
  StaticSubscriptionController,
} from "@/Test";
import { EventsView } from "./EventsView";
import { getStoreInstance } from "@/UI/Store";
import {
  DataProviderImpl,
  DataManagerImpl,
  EventsHookHelper,
  EventsStateHelper,
} from "@/UI/Data";
import { ServicesContext } from "@/UI/ServicesContext";
import { StoreProvider } from "easy-peasy";
import { identity } from "lodash";

export default {
  title: "EventsView",
  component: EventsView,
};

const Template: React.FC<{ outcome: Outcome<"Events"> }> = ({ outcome }) => {
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl([
    new EventsHookHelper(
      new DataManagerImpl<"Events">(
        new InstantFetcher<"Events">(outcome),
        new EventsStateHelper(store),
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
        <EventsView qualifier={instance} title="" icon={<></>} />
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

export const MultipleSuccessful: React.FC = () => (
  <Template outcome={{ kind: "Success", data: { data: instanceEvents } }} />
);

export const MultipleTypes: React.FC = () => (
  <Template
    outcome={{ kind: "Success", data: { data: ignoredErrorNormalEvents } }}
  />
);
