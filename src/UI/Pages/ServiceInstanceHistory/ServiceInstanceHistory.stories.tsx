import React from "react";
import { InstanceLog as InstanceLogModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  InstantFetcher,
  InstanceLog,
  Service,
  DynamicQueryManagerResolver,
} from "@/Test";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import {
  QueryResolverImpl,
  InstanceLogsQueryManager,
  InstanceLogsStateHelper,
} from "@/UI/Data";

export default {
  title: "ServiceInstanceHistory",
  component: ServiceInstanceHistory,
};

const Template: React.FC<{ logs: InstanceLogModel[] }> = ({ logs }) => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new InstanceLogsQueryManager(
        new InstantFetcher<"InstanceLogs">({
          kind: "Success",
          data: { data: logs },
        }),
        new InstanceLogsStateHelper(store),
        Service.a.environment
      ),
    ])
  );

  return (
    <DependencyProvider dependencies={{ queryResolver }}>
      <StoreProvider store={store}>
        <ServiceInstanceHistory
          service={Service.a}
          instanceId={InstanceLog.a.service_instance_id}
        />
      </StoreProvider>
    </DependencyProvider>
  );
};

export const Empty: React.FC = () => <Template logs={[]} />;

export const One: React.FC = () => <Template logs={[InstanceLog.a]} />;

export const Multiple: React.FC = () => <Template logs={InstanceLog.listB} />;
