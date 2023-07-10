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
import useFeatureFlags from "../Dependency/useFeatureFlags";
import { Root } from "./Root";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const environmentsManager = GetEnvironmentsQueryManager(
    apiHelper,
    GetEnvironmentsStateHelper(store)
  );

  const getServerStatusManager = GetServerStatusOneTimeQueryManager(
    apiHelper,
    GetServerStatusStateHelper(store)
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
  const Component: React.FC = () => {
    const featureFlagController = useFeatureFlags(apiHelper);
    return (
      <MemoryRouter initialEntries={["/"]}>
        <StoreProvider store={store}>
          <DependencyProvider
            dependencies={{
              ...dependencies,
              queryResolver,
              environmentHandler,
              featureFlagController,
            }}
          >
            <Root />
          </DependencyProvider>
        </StoreProvider>
      </MemoryRouter>
    );
  };
  const component = <Component />;
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
