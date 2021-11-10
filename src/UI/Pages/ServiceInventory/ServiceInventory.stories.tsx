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
  useEnvironment,
} from "@/Data";
import {
  Service,
  ServiceInstance,
  Pagination,
  StaticScheduler,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  DynamicCommandManagerResolver,
  MockEnvironmentModifier,
  MockCommandManager,
  DeferredApiHelper,
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
    new InstantApiHelper({
      kind: "Success",
      data: {
        data: [ServiceInstance.a],
        links: Pagination.links,
        metadata: Pagination.metadata,
      },
    }),
    new ServiceInstancesStateHelper(store, Service.a.environment),
    scheduler,
    useEnvironment
  );

  const resourcesHelper = new InstanceResourcesQueryManager(
    apiHelper,
    new InstanceResourcesStateHelper(store),
    scheduler,
    useEnvironment
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
        queryResolver,
        commandResolver,
        environmentModifier: new MockEnvironmentModifier(),
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
    new InstantApiHelper({
      kind: "Failed",
      error: "fake error message",
    }),
    new ServiceInstancesStateHelper(store, Service.a.environment),
    scheduler,
    useEnvironment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([serviceInstancesHelper])
  );

  return (
    <DependencyProvider dependencies={{ queryResolver }}>
      <StoreProvider store={store}>
        <MemoryRouter>
          <ServiceInventory serviceName={Service.a.name} service={Service.a} />
        </MemoryRouter>
      </StoreProvider>
    </DependencyProvider>
  );
};
