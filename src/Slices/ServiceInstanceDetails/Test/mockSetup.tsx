import React, { PropsWithChildren } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreProvider } from "easy-peasy";
import { RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import {
  DependencyProvider,
  EnvironmentHandlerImpl,
  EnvironmentModifierImpl,
} from "@/UI";
import { ServiceInstanceDetails } from "../UI/Page";

/**
 * Mock setup for the test cases of the Instance Details page.
 *
 * @param {boolean} expertMode - whether to activate the expert mode in the state or not.
 * @returns {React.FC} A React Element rendering the test setup for Instance Details Page
 */
export const setupServiceInstanceDetails = (
  expertMode: boolean = false,
): React.JSX.Element => {
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
export const SetupWrapper: React.FC<PropsWithChildren<Props>> = ({
  children,
  expertMode,
}) => {
  const queryClient = new QueryClient();
  const store = getStoreInstance();

  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager,
  );

  const environmentModifier = EnvironmentModifierImpl();

  store.dispatch.environment.setSettingsData({
    environment: "aaa",
    value: RemoteData.success({
      settings: {
        enable_lsm_expert_mode: expertMode,
      },
      definition: {},
    }),
  });

  store.dispatch.environment.setEnvironments(
    RemoteData.success([
      {
        id: "aaa",
        name: "env-a",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
        settings: {
          enable_lsm_expert_mode: expertMode,
        },
      },
    ]),
  );

  store.dispatch.environment.setEnvironmentDetailsById({
    id: "aaa",
    value: RemoteData.success({
      id: "aaa",
      name: "env-a",
      project_id: "ppp",
      repo_branch: "branch",
      repo_url: "repo",
      projectName: "project",
      halted: false,
      settings: {
        enable_lsm_expert_mode: expertMode,
      },
    }),
  });

  environmentModifier.setEnvironment("aaa");

  return (
    <MemoryRouter
      initialEntries={[
        {
          pathname: "/lsm/catalog/mobileCore/inventory/core1/1d96a1ab/details",
          search: "?env=aaa",
        },
      ]}
    >
      <QueryClientProvider client={queryClient}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentHandler,
            environmentModifier,
          }}
        >
          <StoreProvider store={store}>{children}</StoreProvider>
        </DependencyProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};
