import React from "react";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import {
  QueryResolverImpl,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  InstanceResourcesQueryManager,
  InstanceResourcesStateHelper,
  getStoreInstance,
  CommandResolverImpl,
} from "@/Data";
import {
  Service,
  ServiceInstance,
  Pagination,
  StaticScheduler,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  DynamicCommandManagerResolver,
  MockCommandManager,
  DeferredApiHelper,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ServiceInventory } from "./ServiceInventory";

export default {
  title: "ServiceInventory",
  component: ServiceInventory,
};

export const Basic: React.FC = () => {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const serviceInstancesHelper = new ServiceInstancesQueryManager(
    new InstantApiHelper(() => ({
      kind: "Success",
      data: {
        data: [ServiceInstance.a],
        links: Pagination.links,
        metadata: Pagination.metadata,
      },
    })),
    new ServiceInstancesStateHelper(store),
    scheduler
  );

  const resourcesHelper = new InstanceResourcesQueryManager(
    apiHelper,
    new InstanceResourcesStateHelper(store),
    new ServiceInstancesStateHelper(store),
    scheduler
  );

  const catchAllCommandManager = new MockCommandManager();

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([catchAllCommandManager])
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([serviceInstancesHelper, resourcesHelper])
  );

  return (
    <DependencyProvider
      dependencies={{
        ...dependencies,
        queryResolver,
        commandResolver,
      }}
    >
      <StoreProvider store={store}>
        <MemoryRouter>
          <ServiceInventory serviceName={Service.a.name} service={Service.a} />
        </MemoryRouter>
      </StoreProvider>
    </DependencyProvider>
  );
};

export const Failed: React.FC = () => {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const serviceInstancesHelper = new ServiceInstancesQueryManager(
    new InstantApiHelper(() => ({
      kind: "Failed",
      error: `The following error occured while communicating with the server: 400 Bad Request 
Invalid request: Filter validation failed: 1 validation error for st_filter
id -> 0
  value is not a valid uuid (type=type_error.uuid), values provided: {'id': ['12']}`,
    })),
    new ServiceInstancesStateHelper(store),
    scheduler
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([serviceInstancesHelper])
  );

  return (
    <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
      <StoreProvider store={store}>
        <MemoryRouter>
          <ServiceInventory serviceName={Service.a.name} service={Service.a} />
        </MemoryRouter>
      </StoreProvider>
    </DependencyProvider>
  );
};
