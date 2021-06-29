import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicQueryManagerResolver,
  LatestReleasedResource,
  StaticScheduler,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  getStoreInstance,
  LatestReleasedResourcesQueryManager,
  LatestReleasedResourcesStateHelper,
} from "@/Data";
import { ResourcesView } from "./ResourcesView";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredFetcher<"LatestReleasedResources">();
  const environment = "34a961ba-db3c-486e-8d85-1438d8e88909";
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new LatestReleasedResourcesQueryManager(
        apiHelper,
        new LatestReleasedResourcesStateHelper(store, environment),
        scheduler,
        environment
      ),
    ])
  );

  const component = (
    <DependencyProvider dependencies={{ queryResolver }}>
      <StoreProvider store={store}>
        <ResourcesView />
      </StoreProvider>
    </DependencyProvider>
  );

  return { component, apiHelper, scheduler };
}

test("ResourcesView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
    })
  );

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Empty" })
  ).toBeInTheDocument();
});

test("ResourcesView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Failed" })
  ).toBeInTheDocument();
});

test("ResourcesView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: LatestReleasedResource.list,
    })
  );

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" })
  ).toBeInTheDocument();
});
