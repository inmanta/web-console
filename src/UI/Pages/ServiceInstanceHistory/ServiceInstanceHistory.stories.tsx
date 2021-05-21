import React from "react";
import { InstanceLog as InstanceLogModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  InstantFetcher,
  InstanceLog,
  Service,
  DynamicDataManagerResolver,
} from "@/Test";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import {
  DataProviderImpl,
  InstanceLogsDataManager,
  InstanceLogsStateHelper,
} from "@/UI/Data";

export default {
  title: "ServiceInstanceHistory",
  component: ServiceInstanceHistory,
};

const Template: React.FC<{ logs: InstanceLogModel[] }> = ({ logs }) => {
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl(
    new DynamicDataManagerResolver([
      new InstanceLogsDataManager(
        new InstantFetcher<"InstanceLogs">({
          kind: "Success",
          data: { data: logs },
        }),
        new InstanceLogsStateHelper(store),
        Service.A.environment
      ),
    ])
  );

  return (
    <DependencyProvider dependencies={{ dataProvider }}>
      <StoreProvider store={store}>
        <ServiceInstanceHistory
          service={Service.A}
          instanceId={InstanceLog.A.service_instance_id}
        />
      </StoreProvider>
    </DependencyProvider>
  );
};

export const Empty: React.FC = () => <Template logs={[]} />;

export const One: React.FC = () => <Template logs={[InstanceLog.A]} />;

export const Multiple: React.FC = () => <Template logs={InstanceLog.list2} />;
