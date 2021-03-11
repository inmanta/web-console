import React from "react";
import { InstanceLog as InstanceLogModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  InstantFetcher,
  InstanceLog,
  Service,
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

const Template: React.FC<{ logs: InstanceLogModel[] }> = ({ logs }) => {
  const { service_instance_id, environment } = InstanceLog.A;
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl([
    new InstanceLogsHookHelper(
      new DataManagerImpl<"InstanceLogs">(
        new InstantFetcher<"InstanceLogs">({
          kind: "Success",
          data: logs,
        }),
        new InstanceLogsStateHelper(store)
      ),
      new StaticSubscriptionController()
    ),
  ]);

  return (
    <ServicesContext.Provider value={{ dataProvider }}>
      <StoreProvider store={store}>
        <ServiceInstanceHistory
          service={Service.A}
          instanceId={service_instance_id}
          environment={environment}
        />
      </StoreProvider>
    </ServicesContext.Provider>
  );
};

export const Empty: React.FC = () => <Template logs={[]} />;

export const One: React.FC = () => <Template logs={[InstanceLog.A]} />;

export const Multiple: React.FC = () => <Template logs={InstanceLog.list2} />;
