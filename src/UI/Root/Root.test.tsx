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
  GetEnvironmentsStateHelper,
  GetEnvironmentsQueryManager,
} from "@/Data";
import {
  GetEnvironmentsContinuousQueryManager,
  GetEnvironmentsContinuousStateHelper,
} from "@/Data/Managers/GetEnvironmentsContinuous";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  Project,
  ServerStatus,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { Root } from "./Root";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const environmentsStateHelper = GetEnvironmentsStateHelper(store);
  const environmentManagerOneTime = GetEnvironmentsQueryManager(
    apiHelper,
    environmentsStateHelper
  );

  const environmentsManager = GetEnvironmentsContinuousQueryManager(
    apiHelper,
    scheduler,
    GetEnvironmentsContinuousStateHelper(store)
  );

  const getServerStatusManager = GetServerStatusOneTimeQueryManager(
    apiHelper,
    GetServerStatusStateHelper(store)
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      environmentsManager,
      environmentManagerOneTime,
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

beforeAll(() => {
  jest.mock("@/UI/Utils/useFeatures");
});

afterAll(() => {
  jest.clearAllMocks();
});

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
