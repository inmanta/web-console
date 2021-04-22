import React from "react";
import { ServiceModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import { StaticSubscriptionController, DeferredFetcher, Service } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  ServiceInstancesDataManager,
  ServiceInstancesStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "../ServiceInventory";
import { MemoryRouter } from "react-router-dom";

export interface Handles {
  component: React.ReactElement;
  serviceInstancesFetcher: DeferredFetcher<"ServiceInstances">;
}

export class ServiceInventoryPrepper {
  build(service: ServiceModel = Service.A): Handles {
    const store = getStoreInstance();
    const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
    const serviceInstancesSubscriptionController = new StaticSubscriptionController();
    const serviceInstancesHelper = new ServiceInstancesDataManager(
      serviceInstancesFetcher,
      new ServiceInstancesStateHelper(store),
      serviceInstancesSubscriptionController
    );

    const dataProvider = new DataProviderImpl([serviceInstancesHelper]);

    const component = (
      <MemoryRouter>
        <DependencyProvider dependencies={{ dataProvider }}>
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

    return { component, serviceInstancesFetcher };
  }
}
