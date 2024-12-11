import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  UseQueryResult,
} from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { RemoteData, ServiceInstanceModel, ServiceModel } from "@/Core";
import { getStoreInstance } from "@/Data";
import { InstanceLog } from "@/Slices/ServiceInstanceHistory/Core/Domain";
import { dependencies } from "@/Test";
import {
  DependencyProvider,
  EnvironmentHandlerImpl,
  EnvironmentModifierImpl,
} from "@/UI";
import { InstanceDetailsContext } from "../../Core/Context";
import { instanceData } from "../../Test/mockData";
import {
  errorServerInstance,
  emptyResourcesServer,
  defaultServer,
} from "../../Test/mockServer";
import { ResourcesTabContent } from "./ResourcesTabContent";

const setup = (instance: ServiceInstanceModel) => {
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
      settings: {},
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
        settings: {},
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
      settings: {},
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
          <StoreProvider store={store}>
            <InstanceDetailsContext.Provider
              value={{
                instance,
                logsQuery: {} as UseQueryResult<InstanceLog[], Error>,
                serviceModelQuery: {} as UseQueryResult<ServiceModel, Error>,
              }}
            >
              <ResourcesTabContent />
            </InstanceDetailsContext.Provider>
          </StoreProvider>
        </DependencyProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

//Note: success view is test in the Page.test.tsx file as we cover there logic for redirecting to the proper tab when changing version

it("should render error view correctly", async () => {
  const server = errorServerInstance;

  server.listen();

  render(setup(instanceData));

  expect(
    await screen.findByLabelText("Error_view-Resources-content"),
  ).toBeVisible();
  expect(screen.getByText("Something went wrong")).toBeVisible();
  expect(
    screen.getByText(
      "Failed to fetch service instance resources for instance of id: 1d96a1ab",
    ),
  ).toBeVisible();

  server.close();
});

it("should render information about no resources correctly", async () => {
  const server = emptyResourcesServer;

  server.listen();

  render(setup({ ...instanceData, deployment_progress: null }));

  expect(await screen.findByText("No resources found")).toBeVisible();
  expect(
    screen.getByText("No resources could be found for this instance."),
  ).toBeVisible();

  server.close();
});

it("should render information about no deployment progress data correctly", async () => {
  const server = defaultServer;

  server.listen();

  render(setup({ ...instanceData, deployment_progress: undefined }));

  expect(
    await screen.findByText("There is no data about deployment progress."),
  ).toBeVisible();

  server.close();
});
