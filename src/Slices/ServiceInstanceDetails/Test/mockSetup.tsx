import React from "react";
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

export const setupServiceInstanceDetails = (expertMode = false) => {
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

  const component = (
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
          <StoreProvider store={store}>
            <Page>
              <ServiceInstanceDetails
                instance="core1"
                service="mobileCore"
                instanceId="1d96a1ab"
              />
            </Page>
          </StoreProvider>
        </DependencyProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );

  return component;
};
