import React, { PropsWithChildren } from "react";
import { loader } from "@monaco-editor/react";
import { Page } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as monaco from "monaco-editor";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ServiceInstanceDetails } from "../UI/Page";

/**
 * Mock setup for the test cases of the Instance Details page.
 *
 * @param {boolean} expertMode - whether to activate the expert mode in the state or not.
 * @returns {React.FC} A React Element rendering the test setup for Instance Details Page
 */
export const setupServiceInstanceDetails = (expertMode: boolean = false): React.JSX.Element => {
  const component = (
    <SetupWrapper expertMode={expertMode}>
      <Page>
        <ServiceInstanceDetails
          instance="core1"
          service="mobileCore"
          instanceId="1d96a1ab"
          version="1"
        />
      </Page>
    </SetupWrapper>
  );

  return component;
};

interface Props {
  expertMode: boolean;
}

/**
 * Wrapper for the test setup of the Instance Details page.
 *
 * @params {Props} props - The props of the component.
 * @param {boolean} expertMode - whether to activate the expert mode in the state or not.
 * @returns {React.FC<PropsWithChildren<Props>>} A React Component that provides the test setup for Instance Details Page
 */
export const SetupWrapper: React.FC<PropsWithChildren<Props>> = ({ children, expertMode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  loader.config({ monaco });
  loader.init();

  return (
    <TestMemoryRouter
      initialEntries={[
        "/lsm/catalog/mobileCore/inventory/core1/1d96a1ab/details?env=c85c0a64-ed45-4cba-bdc5-703f65a225f7",
      ]}
    >
      <QueryClientProvider client={queryClient}>
        <MockedDependencyProvider
          env={{ ...EnvironmentDetails.a, settings: { enable_lsm_expert_mode: expertMode } }}
        >
          {children}
        </MockedDependencyProvider>
      </QueryClientProvider>
    </TestMemoryRouter>
  );
};
