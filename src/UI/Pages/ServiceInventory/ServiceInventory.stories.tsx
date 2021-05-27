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
  DynamicQueryManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  ResourcesQueryManager,
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
      data: [ServiceInstance.a],
      links: Pagination.links,
      metadata: Pagination.metadata,
    },
  });

  const serviceInstancesHelper = new ServiceInstancesQueryManager(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store, Service.a.environment),
    scheduler,
    Service.a.environment
  );
  const resourcesFetcher = new InstantFetcher<"Resources">({
    kind: "Success",
    data: { data: Resources.B },
  });

  const resourcesHelper = new ResourcesQueryManager(
    resourcesFetcher,
    new ResourcesStateHelper(store),
    scheduler,
    Service.a.environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([serviceInstancesHelper, resourcesHelper])
  );

  return (
    <DependencyProvider dependencies={{ queryResolver }}>
      <StoreProvider store={store}>
        <MemoryRouter>
          <ServiceInventory
            serviceName={Service.a.name}
            environmentId={Service.a.environment}
            service={Service.a}
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
  const serviceInstancesHelper = new ServiceInstancesQueryManager(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store, Service.a.environment),
    scheduler,
    Service.a.environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([serviceInstancesHelper])
  );

  return (
    <DependencyProvider dependencies={{ queryResolver }}>
      <StoreProvider store={store}>
        <MemoryRouter>
          <ServiceInventory
            serviceName={Service.a.name}
            environmentId={Service.a.environment}
            service={Service.a}
          />
        </MemoryRouter>
      </StoreProvider>
    </DependencyProvider>
  );
};
