import React from "react";
import { RawDiagnostics } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  InstantFetcher,
  InstanceLog,
  Service,
  StaticScheduler,
  DynamicQueryManagerResolver,
  Diagnose,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  DiagnosticsQueryManager,
  DiagnosticsStateHelper,
  getStoreInstance,
} from "@/Data";
import { UrlManagerImpl } from "@/UI/Utils";
import { Diagnose as DiagnoseComponent } from "./Diagnose";

export default {
  title: "Diagnose",
  component: DiagnoseComponent,
};

const Template: React.FC<{ diagnostics: RawDiagnostics }> = ({
  diagnostics,
}) => {
  const { service_instance_id, environment } = InstanceLog.a;
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new DiagnosticsQueryManager(
        new InstantFetcher<"Diagnostics">({
          kind: "Success",
          data: { data: diagnostics },
        }),
        new DiagnosticsStateHelper(store),
        new StaticScheduler(),
        environment
      ),
    ])
  );
  const urlManager = new UrlManagerImpl("", environment);

  return (
    <DependencyProvider dependencies={{ queryResolver, urlManager }}>
      <StoreProvider store={store}>
        <DiagnoseComponent
          service={Service.a}
          instanceId={service_instance_id}
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
