import React from "react";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { InstanceLog as InstanceLogModel } from "@/Core";
import {
  QueryResolverImpl,
  GetInstanceLogsQueryManager,
  GetInstanceLogsStateHelper,
  getStoreInstance,
} from "@/Data";
import {
  InstanceLog,
  Service,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

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
        new StaticScheduler()
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
