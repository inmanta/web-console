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
  DeferredFetcher,
  DynamicQueryManagerResolver,
  ServerStatus,
} from "@/Test";
import { MemoryRouter } from "react-router";
import { Either } from "@/Core";

function setup() {
  const store = getStoreInstance();
  const projectsManager = new ProjectsQueryManager(
    new DeferredFetcher<"Projects">(),
    new ProjectsStateHelper(store)
  );

  const getServerStatusFetcher = new DeferredFetcher<"GetServerStatus">();
  const getServerStatusManager = new GetServerStatusQueryManager(
    getServerStatusFetcher,
    new GetServerStatusStateHelper(store)
  );
  const featureManager = new PrimaryFeatureManager();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([projectsManager, getServerStatusManager])
  );
  return {
    featureManager,
    queryResolver,
    getServerStatusFetcher,
    store,
  };
}

test("GIVEN the app THEN the navigation toggle button should be visible", async () => {
  fetchMock.mockResponse(JSON.stringify({}));
  const { store, queryResolver, featureManager, getServerStatusFetcher } =
    setup();

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
    await getServerStatusFetcher.resolve(
      Either.right({ data: ServerStatus.withLsm })
    );
  });

  expect(
    screen.getByRole("button", { name: "Global navigation" })
  ).toBeVisible();
});
