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
  DeleteInstanceCommandManager,
  QueryResolverImpl,
  ResourcesQueryManager,
  ResourcesStateHelper,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  SetStatePoster,
  TriggerInstanceUpdateCommandManager,
  TriggerSetStateCommandManager,
} from "@/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "@/UI/Pages/ServiceInventory";
import { MemoryRouter } from "react-router-dom";
import { UrlManagerImpl } from "@/UI/Routing";
import {
  BaseApiHelper,
  InstanceDeleter,
  KeycloakAuthHelper,
  TriggerInstanceUpdatePatcher,
} from "@/Infra";

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

    const triggerUpdateCommandManager = new TriggerInstanceUpdateCommandManager(
      new TriggerInstanceUpdatePatcher(new BaseApiHelper(), "env1"),
      new AttributeResultConverterImpl()
    );
    const deleteCommandManager = new DeleteInstanceCommandManager(
      new InstanceDeleter(new BaseApiHelper(), "env1")
    );

    const setStateCommandManager = new TriggerSetStateCommandManager(
      new KeycloakAuthHelper(),
      new SetStatePoster(new BaseApiHelper(), "env1")
    );

    const commandResolver = new CommandResolverImpl(
      new DynamicCommandManagerResolver([
        triggerUpdateCommandManager,
        deleteCommandManager,
        setStateCommandManager,
      ])
    );

    const component = (
      <MemoryRouter>
        <DependencyProvider
          dependencies={{ queryResolver, urlManager, commandResolver }}
        >
          <StoreProvider store={store}>
            <ServiceInventory serviceName={service.name} service={service} />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    );

    return { component, scheduler, serviceInstancesFetcher, resourcesFetcher };
  }
}
