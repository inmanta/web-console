import React from "react";
import { SchedulerImpl, ServiceModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Service,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  AttributeResultConverterImpl,
  CommandResolverImpl,
  QueryResolverImpl,
  ResourcesQueryManager,
  ResourcesStateHelper,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  UpdateInstanceCommandManager,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "@/UI/Pages/ServiceInventory";
import { MemoryRouter } from "react-router-dom";
import { UrlManagerImpl } from "@/UI/Routing";
import { BaseApiHelper } from "@/Infra";
import { UpdateInstancePatcher } from "@/Infra/Api/UpdateInstancePatcher";

export interface Handles {
  component: React.ReactElement;
  scheduler: SchedulerImpl;
  serviceInstancesFetcher: DeferredFetcher<"ServiceInstances">;
  resourcesFetcher: DeferredFetcher<"Resources">;
}

export class ServiceInventoryPrepper {
  prep(service: ServiceModel = Service.a): Handles {
    const store = getStoreInstance();
    const scheduler = new SchedulerImpl(5000, (task) => ({
      effect: jest.fn(() => task.effect()),
      update: jest.fn((result) => task.update(result)),
    }));
    const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
    const serviceInstancesHelper = new ServiceInstancesQueryManager(
      serviceInstancesFetcher,
      new ServiceInstancesStateHelper(store, service.environment),
      scheduler,
      service.environment
    );

    const resourcesFetcher = new DeferredFetcher<"Resources">();
    const resourcesHelper = new ResourcesQueryManager(
      resourcesFetcher,
      new ResourcesStateHelper(store),
      scheduler,
      service.environment
    );

    const queryResolver = new QueryResolverImpl(
      new DynamicQueryManagerResolver([serviceInstancesHelper, resourcesHelper])
    );
    const urlManager = new UrlManagerImpl("", service.environment);

    const commandManager = new UpdateInstanceCommandManager(
      new UpdateInstancePatcher(new BaseApiHelper(), "env1"),
      new AttributeResultConverterImpl()
    );

    const commandResolver = new CommandResolverImpl(
      new DynamicCommandManagerResolver([commandManager])
    );

    const component = (
      <MemoryRouter>
        <DependencyProvider
          dependencies={{ queryResolver, urlManager, commandResolver }}
        >
          <StoreProvider store={store}>
            <ServiceInventory
              serviceName={service.name}
              environmentId={service.environment}
              service={service}
            />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    );

    return { component, scheduler, serviceInstancesFetcher, resourcesFetcher };
  }
}
