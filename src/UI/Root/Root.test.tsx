import React from "react";
import { MemoryRouter } from "react-router";
import { useLocation } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  GetServerStatusOneTimeQueryManager,
  GetServerStatusStateHelper,
  GetEnvironmentsQueryManager,
  GetEnvironmentsStateHelper,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  Project,
  ServerStatus,
} from "@/Test";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { Root } from "./Root";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const environmentsManager = new GetEnvironmentsQueryManager(
    apiHelper,
    new GetEnvironmentsStateHelper(store)
  );

  const getServerStatusManager = new GetServerStatusOneTimeQueryManager(
    apiHelper,
    new GetServerStatusStateHelper(store)
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      environmentsManager,
      getServerStatusManager,
    ])
  );

  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager
  );

  const component = (
    <MemoryRouter initialEntries={["/"]}>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{ ...dependencies, queryResolver, environmentHandler }}
        >
          <Root />
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
    await apiHelper.resolve(Either.right({ data: Project.list }));
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
    await apiHelper.resolve(Either.right({ data: Project.list }));
  });

  expect(
    screen.getByRole("link", { name: "documentation link" })
  ).toBeVisible();
});
