import React from "react";
import { InstanceLog as InstanceLogModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import { InstantFetcher, InstanceLog, Service } from "@/Test";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import {
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
      new InstantFetcher<"InstanceLogs">({
        kind: "Success",
        data: { data: logs },
      }),
      new InstanceLogsStateHelper(store)
    ),
  ]);

  return (
    <DependencyProvider dependencies={{ dataProvider }}>
      <StoreProvider store={store}>
        <ServiceInstanceHistory
          service={Service.A}
          instanceId={service_instance_id}
          environment={environment}
        />
      </StoreProvider>
    </DependencyProvider>
  );
};

export const Empty: React.FC = () => <Template logs={[]} />;

export const One: React.FC = () => <Template logs={[InstanceLog.A]} />;

export const Multiple: React.FC = () => <Template logs={InstanceLog.list2} />;
