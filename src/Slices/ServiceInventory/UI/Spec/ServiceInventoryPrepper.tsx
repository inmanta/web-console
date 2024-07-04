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
  getStoreInstance,
  TriggerForceStateCommandManager,
  DestroyInstanceCommandManager,
} from "@/Data";
import { defaultAuthContext } from "@/Data/Auth/AuthContext";
import { AuthProvider } from "@/Data/Auth/AuthProvider";
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
      BaseApiHelper(undefined, defaultAuthContext),
    );
    const triggerDestroyInstanceCommandManager =
      DestroyInstanceCommandManager(apiHelper);
    const triggerforceStateCommandManager = TriggerForceStateCommandManager(
      defaultAuthContext,
      apiHelper,
    );

    const deleteCommandManager = DeleteInstanceCommandManager(apiHelper);

    const setStateCommandManager = TriggerSetStateCommandManager(
      defaultAuthContext,
      BaseApiHelper(undefined, defaultAuthContext),
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
        <AuthProvider config={undefined}>
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
        </AuthProvider>
      </MemoryRouter>
    );

    return { component, scheduler, apiHelper };
  }
}
