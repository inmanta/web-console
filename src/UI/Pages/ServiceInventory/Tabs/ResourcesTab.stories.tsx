import React from "react";
import { BrowserRouter } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { Query } from "@/Core";
import {
  QueryResolverImpl,
  InstanceResourcesStateHelper,
  InstanceResourcesQueryManager,
  getStoreInstance,
} from "@/Data";
import {
  StaticScheduler,
  Outcome,
  InstanceResource,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ResourcesTab } from "./ResourcesTab";

export default {
  title: "ResourcesTab",
  component: ResourcesTab,
};

const Template: React.FC<{
  outcome: Outcome.Type<
    Query.Error<"GetInstanceResources">,
    Query.ApiResponse<"GetInstanceResources">
  >;
}> = ({ outcome }) => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new InstanceResourcesQueryManager(
        new InstantApiHelper(outcome),
        new InstanceResourcesStateHelper(store),
        new StaticScheduler()
      ),
    ])
  );

  return (
    <BrowserRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
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
    </BrowserRouter>
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
  <Template
    outcome={{ kind: "Success", data: { data: InstanceResource.listA } }}
  />
);
