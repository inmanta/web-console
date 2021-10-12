import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import Keycloak from "keycloak-js";
import { App } from "@/UI/Root/app";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  ProjectsQueryManager,
  ProjectsStateHelper,
  getStoreInstance,
} from "@/Data";
import { DeferredFetcher, DynamicQueryManagerResolver } from "@/Test";
import { MemoryRouter } from "react-router";

function setup() {
  const stateHelper = new ProjectsStateHelper(getStoreInstance());
  const projectsManager = new ProjectsQueryManager(
    new DeferredFetcher<"Projects">(),
    stateHelper
  );
  return {
    queryResolver: new QueryResolverImpl(
      new DynamicQueryManagerResolver([projectsManager])
    ),
  };
}

test("GIVEN the app THEN the navigation toggle button should be visible", async () => {
  fetchMock.mockResponse(JSON.stringify({}));
  const keycloak = Keycloak();

  const { queryResolver } = setup();

  render(
    <MemoryRouter initialEntries={["/lsm/catalog"]}>
      <DependencyProvider dependencies={{ queryResolver }}>
        <StoreProvider store={getStoreInstance()}>
          <App keycloak={keycloak} shouldUseAuth={false} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  expect(
    await screen.findByRole("button", { name: "Global navigation" })
  ).toBeVisible();
});
