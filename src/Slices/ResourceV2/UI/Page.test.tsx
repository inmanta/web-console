import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";

import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  KeycloakAuthHelper,
  QueryManagerResolver,
  CommandManagerResolver,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  MockEnvironmentHandler,
  Resource,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ResourceDetails } from "@S/ResourceDetails/Data/Mock";

import { Page } from "./Page";
function setup() {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper)
  );
  const environment = "34a961ba-db3c-486e-8d85-1438d8e88909";

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentHandler: new MockEnvironmentHandler(environment),
        }}
      >
        <StoreProvider store={store}>
          <Page />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
    scheduler,
    environment,
    store,
    environmentModifier: dependencies.environmentModifier,
  };
}

test("ResourcesViewV2 shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesViewV2-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      metadata: {
        total: 0,
        before: 0,
        after: 0,
        page_size: 10,
        deploy_summary: { total: 0, by_state: {} },
      },
      links: { self: "" },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "ResourcesViewV2-Empty" })
  ).toBeInTheDocument();
});

test("GIVEN ResourcesViewV2 WHEN user clicks on expend THEN details are shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(Either.right(Resource.response));

  const rows = await screen.findAllByRole("row", {
    name: "Resource V2 Table Row",
  });

  const toggle = within(rows[0]).getByRole("button", { name: "Details" });
  await userEvent.click(toggle);
  act(() => {
    apiHelper.resolve(Either.right(ResourceDetails.response));
  });
  expect(
    await screen.findByRole("generic", { name: "ResourceDetailsTabs" })
  ).toBeVisible();
});

test("ResourcesView shows sorting buttons for sortable columns", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right(Resource.response));
  const table = await screen.findByRole("grid", {
    name: "Ressources table V2",
  });
  expect(table).toBeVisible();
  expect(within(table).getByRole("button", { name: /type/i })).toBeVisible();
  expect(
    within(table).queryByRole("button", { name: /agent/i })
  ).not.toBeInTheDocument();
  expect(
    within(table).queryByRole("button", { name: /value/i })
  ).not.toBeInTheDocument();
  expect(
    within(table).queryByRole("button", { name: /Number of Dependecies/i })
  ).not.toBeInTheDocument();
  expect(
    within(table).getByRole("button", { name: /Deploy state/i })
  ).toBeVisible();
});

test("ResourcesView sets sorting parameters correctly on click", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right(Resource.response));
  const stateButton = await screen.findByRole("button", {
    name: /Deploy state/i,
  });
  expect(stateButton).toBeVisible();
  await userEvent.click(stateButton);
  expect(apiHelper.pendingRequests[0].url).toContain("&sort=status.asc");
});
