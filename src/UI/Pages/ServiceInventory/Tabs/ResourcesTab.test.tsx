import React from "react";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  InstanceResourcesStateHelper,
  InstanceResourcesQueryManager,
  getStoreInstance,
  useEnvironment,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ResourcesTab } from "./ResourcesTab";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new InstanceResourcesQueryManager(
        apiHelper,
        new InstanceResourcesStateHelper(store),
        scheduler,
        useEnvironment
      ),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <ResourcesTab
            serviceInstanceIdentifier={{
              id: "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
              service_entity: "vlan-assignment",
              version: 4,
            }}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("ResourcesView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: [] }));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Empty" })
  ).toBeInTheDocument();
});

test("ResourcesView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Failed" })
  ).toBeInTheDocument();
});

test("ResourcesView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [{ resource_id: "abc123,v=3", resource_state: "deployed" }],
    })
  );

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Success" })
  ).toBeInTheDocument();
});

test("ResourcesView shows updated table", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: [] }));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Empty" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(
    Either.right({
      data: [{ resource_id: "abc123,v=4", resource_state: "deployed" }],
    })
  );

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Success" })
  ).toBeInTheDocument();
});
