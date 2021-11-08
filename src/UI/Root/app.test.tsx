import React from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import Keycloak from "keycloak-js";
import { App } from "@/UI/Root/app";
import { DependencyProvider } from "@/UI/Dependency";
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
import { MemoryRouter } from "react-router";
import { Either } from "@/Core";

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

  const component = (
    <MemoryRouter initialEntries={["/lsm/catalog"]}>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <App keycloak={Keycloak()} shouldUseAuth={false} />
        </StoreProvider>
      </DependencyProvider>
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
