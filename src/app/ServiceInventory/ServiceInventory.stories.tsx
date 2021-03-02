import React from "react";
import { StoreProvider } from "easy-peasy";
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

export default {
  title: "ServiceInventory",
  component: ServiceInventory,
};

const store = getStoreInstance();

const serviceInstancesFetcher = new InstantFetcher<"ServiceInstances">({
  kind: "Success",
  data: [ServiceInstance.A],
});

const serviceInstancesSubscriptionController = new LiveSubscriptionController(
  2000,
  new IntervalsDictionary()
);
const serviceInstancesHelper = new ServiceInstancesHookHelper(
  new DataManagerImpl<"ServiceInstances">(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store)
  ),
  serviceInstancesSubscriptionController
);

const resourcesFetcher = new InstantFetcher<"Resources">({
  kind: "Success",
  data: Resources.B,
});

const resourcesSubscriptionController = new LiveSubscriptionController(
  2000,
  new IntervalsDictionary()
);
const resourcesHelper = new ResourcesHookHelper(
  new DataManagerImpl<"Resources">(
    resourcesFetcher,
    new ResourcesStateHelper(store)
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
      <ServiceInventory
        serviceName={Service.A.name}
        environmentId={Service.A.environment}
        service={Service.A}
      />
    </StoreProvider>
  </ServicesContext.Provider>
);
