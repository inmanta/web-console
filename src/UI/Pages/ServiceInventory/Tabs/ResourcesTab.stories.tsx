import React from "react";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/UI/Store";
import { StaticScheduler, Outcome, InstantFetcher, Resources } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  ResourcesStateHelper,
  ResourcesDataManager,
} from "@/UI/Data";
import { ResourcesTab } from "./ResourcesTab";
import { UrlManagerImpl } from "@/UI/Routing";

export default {
  title: "ResourcesTab",
  component: ResourcesTab,
};

const Template: React.FC<{ outcome: Outcome<"Resources"> }> = ({ outcome }) => {
  const store = getStoreInstance();
  const instance = {
    id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
    service_entity: "vlan-assignment",
    version: 4,
    environment: "34a961ba-db3c-486e-8d85-1438d8e88909",
  };
  const dataProvider = new DataProviderImpl([
    new ResourcesDataManager(
      new InstantFetcher<"Resources">(outcome),
      new ResourcesStateHelper(store),
      new StaticScheduler(),
      instance.environment
    ),
  ]);

  const urlManager = new UrlManagerImpl("", instance.environment);

  return (
    <DependencyProvider dependencies={{ dataProvider, urlManager }}>
      <StoreProvider store={store}>
        <ResourcesTab qualifier={instance} />
      </StoreProvider>
    </DependencyProvider>
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
