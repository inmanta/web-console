import React from "react";
import { StoreProvider } from "easy-peasy";
import {
  StaticScheduler,
  Outcome,
  InstantFetcher,
  Resource,
  DynamicQueryManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  ResourcesStateHelper,
  ResourcesQueryManager,
  getStoreInstance,
} from "@/Data";
import { UrlManagerImpl } from "@/UI/Utils";
import { ResourcesTab } from "./ResourcesTab";

export default {
  title: "ResourcesTab",
  component: ResourcesTab,
};

const Template: React.FC<{ outcome: Outcome<"Resources"> }> = ({ outcome }) => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ResourcesQueryManager(
        new InstantFetcher<"Resources">(outcome),
        new ResourcesStateHelper(store),
        new StaticScheduler(),
        "34a961ba-db3c-486e-8d85-1438d8e88909"
      ),
    ])
  );

  const urlManager = new UrlManagerImpl(
    "",
    "34a961ba-db3c-486e-8d85-1438d8e88909"
  );

  return (
    <DependencyProvider dependencies={{ queryResolver, urlManager }}>
      <StoreProvider store={store}>
        <ResourcesTab
          serviceInstanceIdentifier={{
            id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
            service_entity: "vlan-assignment",
            version: 4,
          }}
        />
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
  <Template outcome={{ kind: "Success", data: { data: Resource.listA } }} />
);
