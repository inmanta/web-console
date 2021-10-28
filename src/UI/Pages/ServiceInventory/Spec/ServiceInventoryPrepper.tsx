import React from "react";
import { SchedulerImpl, ServiceModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  MockEnvironmentModifier,
  Service,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  AttributeResultConverterImpl,
  CommandResolverImpl,
  DeleteInstanceCommandManager,
  QueryResolverImpl,
  InstanceResourcesQueryManager,
  InstanceResourcesStateHelper,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  TriggerInstanceUpdateCommandManager,
  BaseApiHelper,
  TriggerSetStateCommandManager,
  KeycloakAuthHelper,
  getStoreInstance,
} from "@/Data";
import { ServiceInventory } from "@/UI/Pages/ServiceInventory/ServiceInventory";
import { MemoryRouter } from "react-router-dom";
import { UrlManagerImpl } from "@/UI/Utils";

export interface Handles {
  component: React.ReactElement;
  scheduler: SchedulerImpl;
  apiHelper: DeferredApiHelper;
}

export class ServiceInventoryPrepper {
  prep(service: ServiceModel = Service.a): Handles {
    const store = getStoreInstance();
    const scheduler = new SchedulerImpl(5000, (task) => ({
      effect: jest.fn(() => task.effect()),
      update: jest.fn((result) => task.update(result)),
    }));
    const apiHelper = new DeferredApiHelper();
    const serviceInstancesHelper = new ServiceInstancesQueryManager(
      apiHelper,
      new ServiceInstancesStateHelper(store, service.environment),
      scheduler,
      service.environment
    );

    const resourcesHelper = new InstanceResourcesQueryManager(
      apiHelper,
      new InstanceResourcesStateHelper(store),
      scheduler,
      service.environment
    );

    const queryResolver = new QueryResolverImpl(
      new DynamicQueryManagerResolver([serviceInstancesHelper, resourcesHelper])
    );
    const urlManager = new UrlManagerImpl("", service.environment);

    const triggerUpdateCommandManager = new TriggerInstanceUpdateCommandManager(
      new BaseApiHelper(),
      new AttributeResultConverterImpl(),
      "env1"
    );
    const deleteCommandManager = new DeleteInstanceCommandManager(
      apiHelper,
      "env1"
    );

    const setStateCommandManager = new TriggerSetStateCommandManager(
      new KeycloakAuthHelper(),
      new BaseApiHelper(),
      "env1"
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
          dependencies={{
            ...dependencies,
            queryResolver,
            urlManager,
            commandResolver,
            environmentModifier: new MockEnvironmentModifier(),
          }}
        >
          <StoreProvider store={store}>
            <ServiceInventory serviceName={service.name} service={service} />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    );

    return { component, scheduler, apiHelper };
  }
}
