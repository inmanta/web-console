import React from "react";
import { StoreProvider } from "easy-peasy";
import { RawDiagnostics } from "@/Core";
import {
  QueryResolverImpl,
  DiagnosticsQueryManager,
  DiagnosticsStateHelper,
  getStoreInstance,
} from "@/Data";
import {
  InstanceLog,
  Service,
  StaticScheduler,
  DynamicQueryManagerResolver,
  Diagnose,
  InstantApiHelper,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Diagnose as DiagnoseComponent } from "./Diagnose";

export default {
  title: "Diagnose",
  component: DiagnoseComponent,
};

const Template: React.FC<{ diagnostics: RawDiagnostics }> = ({
  diagnostics,
}) => {
  const { service_instance_id } = InstanceLog.a;
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new DiagnosticsQueryManager(
        new InstantApiHelper({
          kind: "Success",
          data: { data: diagnostics },
        }),
        new DiagnosticsStateHelper(store),
        new StaticScheduler()
      ),
    ])
  );

  return (
    <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
      <StoreProvider store={store}>
        <DiagnoseComponent
          serviceName={Service.a.name}
          instanceId={service_instance_id}
          instanceIdentity={service_instance_id}
        />
      </StoreProvider>
    </DependencyProvider>
  );
};

export const Empty: React.FC = () => (
  <Template diagnostics={{ rejections: [], failures: [] }} />
);

export const Failure: React.FC = () => (
  <Template diagnostics={Diagnose.failure} />
);

export const Rejection: React.FC = () => (
  <Template diagnostics={Diagnose.rejection} />
);

export const FailureAndRejection: React.FC = () => (
  <Template diagnostics={Diagnose.failureAndRejection} />
);
