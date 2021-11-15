import React from "react";
import { MemoryRouter } from "react-router";
import { useLocation, useNavigate } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import Keycloak from "keycloak-js";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  GetServerStatusQueryManager,
  GetServerStatusStateHelper,
  GetEnvironmentsQueryManager,
  GetEnvironmentsStateHelper,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  ServerStatus,
} from "@/Test";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { App } from "@/UI/Root/app";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const environmentsManager = new GetEnvironmentsQueryManager(
    apiHelper,
    new GetEnvironmentsStateHelper(store)
  );

  const getServerStatusManager = new GetServerStatusQueryManager(
    apiHelper,
    new GetServerStatusStateHelper(store)
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      environmentsManager,
      getServerStatusManager,
    ])
  );

  const environmentHandler = new EnvironmentHandlerImpl(
    useLocation,
    (...args) => useNavigate()(...args),
    dependencies.routeManager
  );

  const component = (
    <MemoryRouter initialEntries={["/lsm/catalog"]}>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{ ...dependencies, queryResolver, environmentHandler }}
        >
          <App keycloak={Keycloak()} shouldUseAuth={false} />
        </DependencyProvider>
      </StoreProvider>
    </MemoryRouter>
  );
  return {
    component,
    apiHelper,
  };
}

test("GIVEN the app THEN the navigation toggle button should be visible", async () => {
  fetchMock.mockResponse(JSON.stringify({}));
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withLsm }));
  });

  expect(
    screen.getByRole("button", { name: "Global navigation" })
  ).toBeVisible();
});

test("GIVEN the app THEN the documentation link should be visible", async () => {
  fetchMock.mockResponse(JSON.stringify({}));
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withLsm }));
  });

  expect(
    screen.getByRole("link", { name: "documentation link" })
  ).toBeVisible();
});
