import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import { Either } from "@/Core";
import { getStoreInstance, QueryResolverImpl } from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  Resource,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  GetVersionResourcesQueryManager,
  GetVersionResourcesStateHelper,
} from "@S/DesiredStateDetails/Data";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      GetVersionResourcesQueryManager(
        apiHelper,
        GetVersionResourcesStateHelper(store),
        scheduler
      ),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <Page version="123" />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("GIVEN DesiredStateDetails page THEN shows loading resource table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      url: "/api/v2/desiredstate/123?limit=20&sort=resource_type.asc",
      environment: "env",
    },
  ]);

  expect(
    screen.getByRole("generic", { name: "VersionResourcesTable-Loading" })
  ).toBeVisible();
});

test("GIVEN DesiredStateDetails page WHEN api returns no items THEN shows empty resource table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ ...Resource.responseFromVersion, data: [] })
    );
  });

  expect(
    screen.getByRole("generic", { name: "VersionResourcesTable-Empty" })
  ).toBeVisible();
});

test("GIVEN DesiredStateDetails page WHEN api returns error THEN shows error", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.left("error"));
  });

  expect(
    screen.getByRole("generic", { name: "VersionResourcesTable-Failed" })
  ).toBeVisible();
});

test("GIVEN DesiredStateDetails page WHEN api returns items THEN shows success resource table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.responseFromVersion));
  });

  expect(
    screen.getByRole("grid", { name: "VersionResourcesTable-Success" })
  ).toBeVisible();
});
