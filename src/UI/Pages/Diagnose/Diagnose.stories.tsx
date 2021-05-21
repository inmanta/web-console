import React from "react";
import { RawDiagnostics } from "@/Core";
import { StoreProvider } from "easy-peasy";
import {
  InstantFetcher,
  InstanceLog,
  Service,
  StaticScheduler,
  DynamicDataManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import {
  QueryResolverImpl,
  DiagnosticsDataManager,
  DiagnosticsStateHelper,
} from "@/UI/Data";
import { UrlManagerImpl } from "@/UI/Routing";
import { Diagnose } from "./Diagnose";
import {
  diagnoseFailure,
  diagnoseFailureAndRejection,
  diagnoseRejection,
} from "@/Test/Data/Diagnose";

export default {
  title: "Diagnose",
  component: Diagnose,
};

const Template: React.FC<{ diagnostics: RawDiagnostics }> = ({
  diagnostics,
}) => {
  const { service_instance_id, environment } = InstanceLog.A;
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicDataManagerResolver([
      new DiagnosticsDataManager(
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
        <Diagnose service={Service.A} instanceId={service_instance_id} />
      </StoreProvider>
    </DependencyProvider>
  );
};

export const Empty: React.FC = () => (
  <Template diagnostics={{ rejections: [], failures: [] }} />
);

export const Failure: React.FC = () => (
  <Template diagnostics={diagnoseFailure} />
);

export const Rejection: React.FC = () => (
  <Template diagnostics={diagnoseRejection} />
);

export const FailureAndRejection: React.FC = () => (
  <Template diagnostics={diagnoseFailureAndRejection} />
);
