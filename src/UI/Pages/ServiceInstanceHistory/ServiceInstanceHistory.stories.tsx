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
import {
  QueryResolverImpl,
  InstanceLogsQueryManager,
  InstanceLogsStateHelper,
  getStoreInstance,
} from "@/Data";
import { MemoryRouter } from "react-router-dom";

export default {
  title: "ServiceInstanceHistory",
  component: ServiceInstanceHistory,
};

const Template: React.FC<{ logs: InstanceLogModel[] }> = ({ logs }) => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new InstanceLogsQueryManager(
        new InstantFetcher<"GetInstanceLogs">({
          kind: "Success",
          data: { data: logs },
        }),
        new InstanceLogsStateHelper(store),
        Service.a.environment
      ),
    ])
  );

  return (
    <MemoryRouter>
      <DependencyProvider dependencies={{ queryResolver }}>
        <StoreProvider store={store}>
          <ServiceInstanceHistory
            service={Service.a}
            instanceId={InstanceLog.a.service_instance_id}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
};

export const Empty: React.FC = () => <Template logs={[]} />;

export const One: React.FC = () => <Template logs={[InstanceLog.a]} />;

export const Multiple: React.FC = () => <Template logs={InstanceLog.listB} />;
