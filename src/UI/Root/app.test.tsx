import React from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import Keycloak from "keycloak-js";
import { App } from "@/UI/Root/app";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  ProjectsQueryManager,
  ProjectsStateHelper,
  getStoreInstance,
  GetServerStatusQueryManager,
  GetServerStatusStateHelper,
  PrimaryFeatureManager,
} from "@/Data";
import {
  DeferredApiHelper,
  DynamicQueryManagerResolver,
  ServerStatus,
} from "@/Test";
import { MemoryRouter } from "react-router";
import { Either } from "@/Core";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const projectsManager = new ProjectsQueryManager(
    apiHelper,
    new ProjectsStateHelper(store)
  );

  const getServerStatusManager = new GetServerStatusQueryManager(
    apiHelper,
    new GetServerStatusStateHelper(store)
  );
  const featureManager = new PrimaryFeatureManager();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([projectsManager, getServerStatusManager])
  );
  return {
    featureManager,
    queryResolver,
    apiHelper,
    store,
  };
}

test("GIVEN the app THEN the navigation toggle button should be visible", async () => {
  fetchMock.mockResponse(JSON.stringify({}));
  const { store, queryResolver, featureManager, apiHelper } = setup();

  render(
    <MemoryRouter initialEntries={["/lsm/catalog"]}>
      <DependencyProvider dependencies={{ queryResolver, featureManager }}>
        <StoreProvider store={store}>
          <App keycloak={Keycloak()} shouldUseAuth={false} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withLsm }));
  });

  expect(
    screen.getByRole("button", { name: "Global navigation" })
  ).toBeVisible();
});
