import React from "react";
import { StoreProvider } from "easy-peasy";
import { MemoryRouter } from "react-router-dom";
import {
  Service,
  ServiceInstance,
  Resources,
  InstantFetcher,
  Pagination,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  ServiceInstancesDataManager,
  ServiceInstancesStateHelper,
  ResourcesDataManager,
  ResourcesStateHelper,
  LiveSubscriptionController,
  IntervalsDictionary,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "./ServiceInventory";

export default {
  title: "ServiceInventory",
  component: ServiceInventory,
};

export const Basic: React.FC = () => {
  const store = getStoreInstance();
  const serviceInstancesFetcher = new InstantFetcher<"ServiceInstances">({
    kind: "Success",
    data: {
      data: [ServiceInstance.A],
      links: Pagination.links,
      metadata: Pagination.metadata,
    },
  });
  const serviceInstancesSubscriptionController = new LiveSubscriptionController(
    2000,
    new IntervalsDictionary()
  );
  const serviceInstancesHelper = new ServiceInstancesDataManager(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store),
    serviceInstancesSubscriptionController
  );
  const resourcesFetcher = new InstantFetcher<"Resources">({
    kind: "Success",
    data: { data: Resources.B },
  });

  const resourcesSubscriptionController = new LiveSubscriptionController(
    2000,
    new IntervalsDictionary()
  );
  const resourcesHelper = new ResourcesDataManager(
    resourcesFetcher,
    new ResourcesStateHelper(store),
    resourcesSubscriptionController
  );

  const dataProvider = new DataProviderImpl([
    serviceInstancesHelper,
    resourcesHelper,
  ]);

  return (
    <DependencyProvider dependencies={{ dataProvider }}>
      <StoreProvider store={store}>
        <MemoryRouter>
          <ServiceInventory
            serviceName={Service.A.name}
            environmentId={Service.A.environment}
            service={Service.A}
          />
        </MemoryRouter>
      </StoreProvider>
    </DependencyProvider>
  );
};

export const Failed: React.FC = () => {
  const store = getStoreInstance();
  const serviceInstancesFetcher = new InstantFetcher<"ServiceInstances">({
    kind: "Failed",
    error: "fake error message",
  });
  const serviceInstancesSubscriptionController = new LiveSubscriptionController(
    2000,
    new IntervalsDictionary()
  );
  const serviceInstancesHelper = new ServiceInstancesDataManager(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store),
    serviceInstancesSubscriptionController
  );

  const dataProvider = new DataProviderImpl([serviceInstancesHelper]);

  return (
    <DependencyProvider dependencies={{ dataProvider }}>
      <StoreProvider store={store}>
        <MemoryRouter>
          <ServiceInventory
            serviceName={Service.A.name}
            environmentId={Service.A.environment}
            service={Service.A}
          />
        </MemoryRouter>
      </StoreProvider>
    </DependencyProvider>
  );
};
