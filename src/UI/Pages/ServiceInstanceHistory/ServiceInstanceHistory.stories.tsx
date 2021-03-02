import React from "react";
import { StoreProvider } from "easy-peasy";
import {
  InstantFetcher,
  ServiceInstance,
  StaticSubscriptionController,
} from "@/Test";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { ServicesContext } from "@/UI/ServicesContext";
import { getStoreInstance } from "@/UI/Store";
import {
  DataManagerImpl,
  DataProviderImpl,
  InstanceLogsHookHelper,
  InstanceLogsStateHelper,
} from "@/UI/Data";

export default {
  title: "ServiceInstanceHistory",
  component: ServiceInstanceHistory,
};

export const Default: React.FC = () => {
  const { service_entity, id, environment } = ServiceInstance.A;
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl([
    new InstanceLogsHookHelper(
      new DataManagerImpl<"InstanceLogs">(
        new InstantFetcher<"InstanceLogs">({ kind: "Success", data: [] }),
        new InstanceLogsStateHelper(store)
      ),
      new StaticSubscriptionController()
    ),
  ]);

  return (
    <ServicesContext.Provider value={{ dataProvider }}>
      <StoreProvider store={store}>
        <ServiceInstanceHistory
          service_entity={service_entity}
          instanceId={id}
          environment={environment}
        />
      </StoreProvider>
    </ServicesContext.Provider>
  );
};
