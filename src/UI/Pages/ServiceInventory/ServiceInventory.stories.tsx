import React from "react";
import { StoreProvider } from "easy-peasy";
import { MemoryRouter } from "react-router-dom";
import { Service, ServiceInstance, Resources, InstantFetcher } from "@/Test";
import { ServicesContext } from "@/UI/ServicesContext";
import {
  DataProviderImpl,
  DataManagerImpl,
  ServiceInstancesHookHelper,
  ServiceInstancesStateHelper,
  ResourcesHookHelper,
  ResourcesStateHelper,
  LiveSubscriptionController,
  IntervalsDictionary,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "./ServiceInventory";
import { identity } from "lodash";

export default {
  title: "ServiceInventory",
  component: ServiceInventory,
};

const store = getStoreInstance();

const serviceInstancesFetcher = new InstantFetcher<"ServiceInstances">({
  kind: "Success",
  data: { data: [ServiceInstance.A], links: {} },
});

const serviceInstancesSubscriptionController = new LiveSubscriptionController(
  2000,
  new IntervalsDictionary()
);
const serviceInstancesHelper = new ServiceInstancesHookHelper(
  new DataManagerImpl<"ServiceInstances">(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store),
    ({ data }) => ({ data, handlers: {} })
  ),
  serviceInstancesSubscriptionController
);

const resourcesFetcher = new InstantFetcher<"Resources">({
  kind: "Success",
  data: { data: Resources.B },
});

const resourcesSubscriptionController = new LiveSubscriptionController(
  2000,
  new IntervalsDictionary()
);
const resourcesHelper = new ResourcesHookHelper(
  new DataManagerImpl<"Resources">(
    resourcesFetcher,
    new ResourcesStateHelper(store),
    identity
  ),
  resourcesSubscriptionController
);

const dataProvider = new DataProviderImpl([
  serviceInstancesHelper,
  resourcesHelper,
]);

export const Basic: React.FC = () => (
  <ServicesContext.Provider value={{ dataProvider }}>
    <StoreProvider store={store}>
      <MemoryRouter>
        <ServiceInventory
          serviceName={Service.A.name}
          environmentId={Service.A.environment}
          service={Service.A}
        />
      </MemoryRouter>
    </StoreProvider>
  </ServicesContext.Provider>
);
