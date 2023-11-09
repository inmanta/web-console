import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
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
  TriggerForceStateCommandManager,
  DestroyInstanceCommandManager,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolverImpl,
  DynamicQueryManagerResolverImpl,
  Environment,
  MockEnvironmentModifier,
  Service,
} from "@/Test";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
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
    const serviceInstancesHelper = ServiceInstancesQueryManager(
      apiHelper,
      ServiceInstancesStateHelper(store),
      scheduler,
    );

    const resourcesHelper = InstanceResourcesQueryManager(
      apiHelper,
      InstanceResourcesStateHelper(store),
      ServiceInstancesStateHelper(store),
      scheduler,
    );

    const queryResolver = new QueryResolverImpl(
      new DynamicQueryManagerResolverImpl([
        serviceInstancesHelper,
        resourcesHelper,
      ]),
    );

    const triggerUpdateCommandManager = TriggerInstanceUpdateCommandManager(
      new BaseApiHelper(),
    );
    const triggerDestroyInstanceCommandManager =
      DestroyInstanceCommandManager(apiHelper);
    const triggerforceStateCommandManager = TriggerForceStateCommandManager(
      new KeycloakAuthHelper(),
      apiHelper,
    );

    const deleteCommandManager = DeleteInstanceCommandManager(apiHelper);

    const setStateCommandManager = TriggerSetStateCommandManager(
      new KeycloakAuthHelper(),
      new BaseApiHelper(),
    );

    const commandResolver = new CommandResolverImpl(
      new DynamicCommandManagerResolverImpl([
        triggerUpdateCommandManager,
        deleteCommandManager,
        setStateCommandManager,
        triggerforceStateCommandManager,
        triggerDestroyInstanceCommandManager,
      ]),
    );
    const environmentHandler = EnvironmentHandlerImpl(
      useLocation,
      dependencies.routeManager,
    );
    store.dispatch.environment.setEnvironments(
      RemoteData.success(Environment.filterable),
    );
    const component = (
      <MemoryRouter initialEntries={[{ search: "?env=123" }]}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            queryResolver,
            commandResolver,
            environmentModifier: new MockEnvironmentModifier(),
            environmentHandler,
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
