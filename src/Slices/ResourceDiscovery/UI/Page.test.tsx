import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  QueryManagerResolverImpl,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import * as DiscoveredResources from "../Data/Mock";
import { Page } from "./Page";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
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
    store,
  };
}

test("GIVEN Discovered Resources page THEN shows table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/discovered?limit=20&sort=discovered_resource_id.asc",
    environment: "env",
  });

  apiHelper.resolve(Either.right(DiscoveredResources.response));

  const rows = await screen.findAllByRole("row", {
    name: "DiscoveredResourceRow",
  });
  expect(rows).toHaveLength(17);
  expect(
    within(rows[0]).getByRole("cell", {
      name: "vcenter::VirtualMachine[lab,name=acisim]",
    }),
  ).toBeVisible();
});

test("GIVEN Discovered Resources page THEN sets sorting parameters correctly on click", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right(DiscoveredResources.response));
  const resourceIdButton = await screen.findByRole("button", {
    name: words("discovered.column.resource_id"),
  });
  expect(resourceIdButton).toBeVisible();
  await act(async () => {
    await userEvent.click(resourceIdButton);
  });
  expect(apiHelper.pendingRequests[0].url).toContain(
    "&sort=discovered_resource_id.desc",
  );
});
