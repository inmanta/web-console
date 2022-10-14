import React from "react";
import { StoreProvider } from "easy-peasy";
import { QueryResolverImpl, getStoreInstance } from "@/Data";
import {
  Service,
  StaticScheduler,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  dependencies,
  ServiceInstance,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { RawDiagnostics } from "@S/Diagnose/Core/Domain";
import {
  DiagnosticsQueryManager,
  DiagnosticsStateHelper,
} from "@S/Diagnose/Data";
import * as Diagnose from "@S/Diagnose/Data/Mock";
import { Diagnose as DiagnoseComponent } from "./Diagnose";

export default {
  title: "Diagnose",
  component: DiagnoseComponent,
};

const Template: React.FC<{ diagnostics: RawDiagnostics }> = ({
  diagnostics,
}) => {
  const { id } = ServiceInstance.a;
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      DiagnosticsQueryManager(
        new InstantApiHelper(() => ({
          kind: "Success",
          data: { data: diagnostics },
        })),
        DiagnosticsStateHelper(store),
        new StaticScheduler()
      ),
    ])
  );

  return (
    <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
      <StoreProvider store={store}>
        <DiagnoseComponent
          serviceName={Service.a.name}
          instanceId={id}
          instanceIdentity={id}
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
