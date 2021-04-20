import React from "react";
import { StoreProvider } from "easy-peasy";
import { StaticSubscriptionController, DeferredFetcher, Service } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  DataManagerImpl,
  ServiceInstancesHookHelper,
  ServiceInstancesStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "../ServiceInventory";
import { MemoryRouter } from "react-router-dom";

export interface Handles {
  component: React.ReactElement;
  serviceInstancesFetcher: DeferredFetcher<"ServiceInstances">;
}

export class ServiceInventoryBuilder {
  build(): Handles {
    const store = getStoreInstance();
    const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
    const serviceInstancesSubscriptionController = new StaticSubscriptionController();
    const serviceInstancesHelper = new ServiceInstancesHookHelper(
      new DataManagerImpl<"ServiceInstances">(
        serviceInstancesFetcher,
        new ServiceInstancesStateHelper(store)
      ),
      serviceInstancesSubscriptionController
    );

    const dataProvider = new DataProviderImpl([serviceInstancesHelper]);

    // Render the component
    const component = (
      <MemoryRouter>
        <DependencyProvider dependencies={{ dataProvider }}>
          <StoreProvider store={store}>
            <ServiceInventory
              serviceName={Service.A.name}
              environmentId={Service.A.environment}
              service={Service.A}
            />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    );

    return { component, serviceInstancesFetcher };
  }
}
