import React from "react";
import { App } from "@/UI/App/app";
import Keycloak from "keycloak-js";
import { render, screen, within } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { getStoreInstance } from "@/UI/Store";
import userEvent from "@testing-library/user-event";
import {
  DataProviderImpl,
  ProjectsDataManager,
  ProjectsStateHelper,
} from "../Data";
import { DeferredFetcher, MockRootDependencyManager } from "@/Test";
import { RootDependencyManagerContext } from "../Dependency";

function setup() {
  const stateHelper = new ProjectsStateHelper(getStoreInstance());
  const projectsManager = new ProjectsDataManager(
    new DeferredFetcher<"Projects">(),
    stateHelper
  );
  const primaryProvider = new DataProviderImpl([projectsManager]);
  return new MockRootDependencyManager(primaryProvider);
}

test("GIVEN Navigation THEN shows navigation items", () => {
  fetchMock.mockResponse(JSON.stringify({ data: [] }));
  const keycloak = Keycloak();
  const dependencyManager = setup();

  render(
    <RootDependencyManagerContext.Provider value={dependencyManager}>
      <StoreProvider store={getStoreInstance()}>
        <App keycloak={keycloak} shouldUseAuth={false} />
      </StoreProvider>
    </RootDependencyManagerContext.Provider>
  );

  userEvent.click(screen.getByRole("button", { name: "Global navigation" }));

  const navigation = screen.getByRole("navigation", { name: "Global" });
  expect(navigation).toBeVisible();

  expect(within(navigation).getAllByRole("region").length).toEqual(2);

  expect(
    within(navigation).getByRole("region", {
      name: "Lifecycle service management",
    })
  ).toBeVisible();

  expect(
    within(navigation).getByRole("region", {
      name: "Other sites",
    })
  ).toBeVisible();
});
