import React from "react";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { QueryResolverImpl, getStoreInstance } from "@/Data";
import {
  Service,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  StaticScheduler,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { InstanceLog as InstanceLogModel } from "@S/ServiceInstanceHistory/Core/Domain";
import {
  GetInstanceLogsQueryManager,
  GetInstanceLogsStateHelper,
} from "@S/ServiceInstanceHistory/Data";
import * as InstanceLog from "@S/ServiceInstanceHistory/Data/Mock";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

export default {
  title: "ServiceInstanceHistory",
  component: ServiceInstanceHistory,
};

const Template: React.FC<{ logs: InstanceLogModel[] }> = ({ logs }) => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      GetInstanceLogsQueryManager(
        new InstantApiHelper(() => ({
          kind: "Success",
          data: { data: logs },
        })),
        GetInstanceLogsStateHelper(store),
        new StaticScheduler()
      ),
    ])
  );

  return (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
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
