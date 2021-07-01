import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
import userEvent from "@testing-library/user-event";

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
      metadata: { total: 0, before: 0, after: 0, page_size: 10 },
      links: { self: "" },
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

  apiHelper.resolve(Either.right(LatestReleasedResource.response));

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" })
  ).toBeInTheDocument();
});

test("ResourcesView shows next page of resources", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(
    Either.right({
      data: LatestReleasedResource.response.data.slice(0, 3),
      links: { ...LatestReleasedResource.response.links, next: "/fake-link" },
      metadata: LatestReleasedResource.response.metadata,
    })
  );

  expect(
    await screen.findByRole("cell", {
      name: LatestReleasedResource.response.data[0].id_details
        .resource_id_value,
    })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Next" }));

  apiHelper.resolve(
    Either.right({
      data: LatestReleasedResource.response.data.slice(3),
      links: { ...LatestReleasedResource.response.links, next: "/fake-link" },
      metadata: LatestReleasedResource.response.metadata,
    })
  );

  expect(
    await screen.findByRole("cell", {
      name: LatestReleasedResource.response.data[3].id_details
        .resource_id_value,
    })
  ).toBeInTheDocument();
});

test("ResourcesView shows sorting buttons for sortable columns", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right(LatestReleasedResource.response));
  expect(await screen.findByRole("button", { name: /type/i })).toBeVisible();
  expect(await screen.findByRole("button", { name: /agent/i })).toBeVisible();
  expect(await screen.findByRole("button", { name: /value/i })).toBeVisible();
  expect(screen.queryByRole("button", { name: /Deploy state/i })).toBeVisible();
});

test("ResourcesView sets sorting parameters correctly on click", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right(LatestReleasedResource.response));
  const stateButton = await screen.findByRole("button", { name: /agent/i });
  expect(stateButton).toBeVisible();
  userEvent.click(stateButton);
  expect(apiHelper.getInvocations()[1][1]).toContain("&sort=agent.asc");
});
