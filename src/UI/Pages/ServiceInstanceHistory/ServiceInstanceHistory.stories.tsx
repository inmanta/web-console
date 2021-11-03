import React from "react";
import { InstanceLog as InstanceLogModel } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  InstanceLog,
  Service,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  StaticScheduler,
} from "@/Test";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  GetInstanceLogsQueryManager,
  GetInstanceLogsStateHelper,
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
      new GetInstanceLogsQueryManager(
        new InstantApiHelper({
          kind: "Success",
          data: { data: logs },
        }),
        new GetInstanceLogsStateHelper(store),
        new StaticScheduler(),
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
