import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import { Either } from "@/Core";
import {
  getStoreInstance,
  QueryResolverImpl,
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  ResourceDetails,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { DetailsProvider } from "./DetailsProvider";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ResourceDetailsQueryManager(
        apiHelper,
        new ResourceDetailsStateHelper(store),
        scheduler
      ),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <DetailsProvider resourceId="abc" />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("GIVEN DesiredStateResourceDetails page THEN shows loading page", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      url: "/api/v2/resource/abc",
      environment: "env",
    },
  ]);

  expect(
    screen.getByRole("generic", { name: "ResourceDetails-Loading" })
  ).toBeVisible();
});

test("GIVEN DesiredStateDetails page WHEN api returns error THEN shows error", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.left("error"));
  });

  expect(
    screen.getByRole("generic", { name: "ResourceDetails-Failed" })
  ).toBeVisible();
});

test("GIVEN DesiredStateDetails page WHEN api returns details THEN shows details", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ResourceDetails.a }));
  });

  expect(
    screen.getByRole("generic", { name: "ResourceDetails-Success" })
  ).toBeVisible();
});
