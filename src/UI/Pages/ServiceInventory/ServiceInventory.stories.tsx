import React from "react";
import { StoreProvider } from "easy-peasy";
import { MemoryRouter } from "react-router-dom";
import {
  Service,
  ServiceInstance,
  Resources,
  InstantFetcher,
  Pagination,
  StaticScheduler,
  DynamicDataManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  ServiceInstancesDataManager,
  ServiceInstancesStateHelper,
  ResourcesDataManager,
  ResourcesStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "./ServiceInventory";

export default {
  title: "ServiceInventory",
  component: ServiceInventory,
};

export const Basic: React.FC = () => {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const serviceInstancesFetcher = new InstantFetcher<"ServiceInstances">({
    kind: "Success",
    data: {
      data: [ServiceInstance.A],
      links: Pagination.links,
      metadata: Pagination.metadata,
    },
  });

  const serviceInstancesHelper = new ServiceInstancesDataManager(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store, Service.A.environment),
    scheduler,
    Service.A.environment
  );
  const resourcesFetcher = new InstantFetcher<"Resources">({
    kind: "Success",
    data: { data: Resources.B },
  });

  const resourcesHelper = new ResourcesDataManager(
    resourcesFetcher,
    new ResourcesStateHelper(store),
    scheduler,
    Service.A.environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicDataManagerResolver([serviceInstancesHelper, resourcesHelper])
  );

  return (
    <DependencyProvider dependencies={{ queryResolver }}>
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
  const scheduler = new StaticScheduler();
  const serviceInstancesFetcher = new InstantFetcher<"ServiceInstances">({
    kind: "Failed",
    error: "fake error message",
  });
  const serviceInstancesHelper = new ServiceInstancesDataManager(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store, Service.A.environment),
    scheduler,
    Service.A.environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicDataManagerResolver([serviceInstancesHelper])
  );

  return (
    <DependencyProvider dependencies={{ queryResolver }}>
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
