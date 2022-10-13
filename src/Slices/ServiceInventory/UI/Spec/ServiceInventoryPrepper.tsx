import React from "react";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { RemoteData, SchedulerImpl, ServiceModel } from "@/Core";
import {
  CommandResolverImpl,
  DeleteInstanceCommandManager,
  QueryResolverImpl,
  InstanceResourcesQueryManager,
  InstanceResourcesStateHelper,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  BaseApiHelper,
  TriggerSetStateCommandManager,
  KeycloakAuthHelper,
  getStoreInstance,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Environment,
  MockEnvironmentModifier,
  Service,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { TriggerInstanceUpdateCommandManager } from "@S/EditInstance/Data";
import { ServiceInventory } from "@S/ServiceInventory/UI/ServiceInventory";

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
      new ServiceInstancesStateHelper(store),
      scheduler
    );

    const resourcesHelper = InstanceResourcesQueryManager(
      apiHelper,
      new InstanceResourcesStateHelper(store),
      new ServiceInstancesStateHelper(store),
      scheduler
    );

    const queryResolver = new QueryResolverImpl(
      new DynamicQueryManagerResolver([serviceInstancesHelper, resourcesHelper])
    );

    const triggerUpdateCommandManager = new TriggerInstanceUpdateCommandManager(
      new BaseApiHelper()
    );
    const deleteCommandManager = new DeleteInstanceCommandManager(apiHelper);

    const setStateCommandManager = new TriggerSetStateCommandManager(
      new KeycloakAuthHelper(),
      new BaseApiHelper()
    );

    const commandResolver = new CommandResolverImpl(
      new DynamicCommandManagerResolver([
        triggerUpdateCommandManager,
        deleteCommandManager,
        setStateCommandManager,
      ])
    );

    store.dispatch.environment.setEnvironments(
      RemoteData.success(Environment.filterable)
    );

    const component = (
      <MemoryRouter initialEntries={[{ search: "?env=123" }]}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            queryResolver,
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
