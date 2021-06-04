import React from "react";
import userEvent from "@testing-library/user-event";
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
    <DependencyProvider dependencies={{ queryResolver }}>
      <StoreProvider store={getStoreInstance()}>
        <App keycloak={keycloak} shouldUseAuth={false} />
      </StoreProvider>
    </DependencyProvider>
  );

  expect(
    await screen.findByRole("button", { name: "Global navigation" })
  ).toBeVisible();
});

/**
 * The sidebar starts out 'collapsed' because of JSDOM default window dimensions.
 * On desktop sizes it would start out 'expanded'.
 */
test("GIVEN the app WHEN clicking the navigation toggle THEN the sidebar should be expanded", async () => {
  fetchMock.mockResponse(JSON.stringify({}));
  const keycloak = Keycloak();
  const { queryResolver } = setup();

  render(
    <DependencyProvider dependencies={{ queryResolver }}>
      <StoreProvider store={getStoreInstance()}>
        <App keycloak={keycloak} shouldUseAuth={false} />
      </StoreProvider>
    </DependencyProvider>
  );

  expect(
    screen.queryByRole("generic", { name: "PageSidebar" })
  ).not.toBeInTheDocument();

  userEvent.click(screen.getByRole("button", { name: "Global navigation" }));
  expect(screen.queryByRole("generic", { name: "PageSidebar" })).toBeVisible();
});
