import React from "react";
import { SchedulerImpl, ServiceModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import { DeferredFetcher, Service } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  ResourcesDataManager,
  ResourcesStateHelper,
  ServiceInstancesDataManager,
  ServiceInstancesStateHelper,
  UrlManagerImpl,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "../ServiceInventory";
import { MemoryRouter } from "react-router-dom";

export interface Handles {
  component: React.ReactElement;
  scheduler: SchedulerImpl;
  serviceInstancesFetcher: DeferredFetcher<"ServiceInstances">;
  resourcesFetcher: DeferredFetcher<"Resources">;
}

export class ServiceInventoryPrepper {
  prep(service: ServiceModel = Service.A): Handles {
    const store = getStoreInstance();
    const scheduler = new SchedulerImpl(5000, (task) => ({
      effect: jest.fn(() => task.effect()),
      update: jest.fn((result) => task.update(result)),
    }));
    const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
    const serviceInstancesHelper = new ServiceInstancesDataManager(
      serviceInstancesFetcher,
      new ServiceInstancesStateHelper(store, service.environment),
      scheduler,
      service.environment
    );

    const resourcesFetcher = new DeferredFetcher<"Resources">();
    const resourcesHelper = new ResourcesDataManager(
      resourcesFetcher,
      new ResourcesStateHelper(store),
      scheduler,
      service.environment
    );

    const dataProvider = new DataProviderImpl([
      serviceInstancesHelper,
      resourcesHelper,
    ]);
    const urlManager = new UrlManagerImpl("", service.environment);

    const component = (
      <MemoryRouter>
        <DependencyProvider dependencies={{ dataProvider, urlManager }}>
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
