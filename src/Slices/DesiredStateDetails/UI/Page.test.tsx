import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import { getStoreInstance, QueryResolverImpl } from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolverImpl,
  Resource,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  GetVersionResourcesQueryManager,
  GetVersionResourcesStateHelper,
} from "@S/DesiredStateDetails/Data";
import { Page } from "./Page";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      GetVersionResourcesQueryManager(apiHelper, GetVersionResourcesStateHelper(store), scheduler),
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

  expect(screen.getByRole("region", { name: "VersionResourcesTable-Loading" })).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN DesiredStateDetails page WHEN api returns no items THEN shows empty resource table", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ ...Resource.responseFromVersion, data: [] }));
  });

  expect(screen.getByRole("generic", { name: "VersionResourcesTable-Empty" })).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN DesiredStateDetails page WHEN api returns error THEN shows error", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.left("error"));
  });

  expect(screen.getByRole("region", { name: "VersionResourcesTable-Failed" })).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN DesiredStateDetails page WHEN api returns items THEN shows success resource table", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.responseFromVersion));
  });

  expect(screen.getByRole("grid", { name: "VersionResourcesTable-Success" })).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN DesiredStateDetails page WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
  const { component, apiHelper } = setup();

  render(component);

  //mock that response has more than one site
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...Resource.responseFromVersion,
        metadata: {
          total: 103,
          before: 0,
          after: 3,
          page_size: 100,
        },
        links: {
          self: "",
          next: "/fake-link?end=fake-first-param",
        },
      })
    );
  });

  expect(screen.getByLabelText("Go to next page")).toBeEnabled();

  await userEvent.click(screen.getByLabelText("Go to next page"));

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&sort=resource_type.asc)/);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...Resource.responseFromVersion,
        metadata: {
          total: 23,
          before: 0,
          after: 3,
          page_size: 20,
        },
        links: {
          self: "",
          next: "/fake-link?end=fake-first-param",
        },
      })
    );
  });

  //sort on the second page
  await userEvent.click(screen.getByRole("button", { name: "Type" }));

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
  // we are asserting on the second request as the first request is for the updated sorting event, and second is chained to back to the first page with still correct sorting
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(/(&sort=resource_type.desc)/);
});
