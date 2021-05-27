import React from "react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  Service,
  ServiceInstance,
  Resource,
  Pagination,
  StaticScheduler,
  DynamicQueryManagerResolver,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  ResourcesQueryManager,
  ResourcesStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "./ServiceInventory";
import { MemoryRouter } from "react-router-dom";
import { UrlManagerImpl } from "@/UI/Routing";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
  const serviceInstancesHelper = new ServiceInstancesQueryManager(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store, Service.a.environment),
    scheduler,
    Service.a.environment
  );

  const resourcesFetcher = new DeferredFetcher<"Resources">();
  const resourcesHelper = new ResourcesQueryManager(
    resourcesFetcher,
    new ResourcesStateHelper(store),
    scheduler,
    Service.a.environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([serviceInstancesHelper, resourcesHelper])
  );

  const urlManager = new UrlManagerImpl("", Service.a.environment);

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ queryResolver, urlManager }}>
        <StoreProvider store={store}>
          <ServiceInventory
            serviceName={Service.a.name}
            environmentId={Service.a.environment}
            service={Service.a}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    serviceInstancesFetcher,
    resourcesFetcher,
    scheduler,
  };
}

test("ServiceInventory shows updated instances", async () => {
  const { component, serviceInstancesFetcher, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ServiceInventory-Loading" })
  ).toBeInTheDocument();

  serviceInstancesFetcher.resolve(
    Either.right({
      data: [],
      links: Pagination.links,
      metadata: Pagination.metadata,
    })
  );

  expect(
    await screen.findByRole("generic", { name: "ServiceInventory-Empty" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  serviceInstancesFetcher.resolve(
    Either.right({
      data: [ServiceInstance.a],
      links: Pagination.links,
      metadata: Pagination.metadata,
    })
  );

  expect(
    await screen.findByRole("grid", { name: "ServiceInventory-Success" })
  ).toBeInTheDocument();
});

test("ServiceInventory shows error with retry", async () => {
  const { component, serviceInstancesFetcher } = setup();
  render(component);

  serviceInstancesFetcher.resolve(Either.left("fake error"));

  expect(
    await screen.findByRole("generic", { name: "ServiceInventory-Failed" })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Retry" }));

  serviceInstancesFetcher.resolve(
    Either.right({
      data: [ServiceInstance.a],
      links: Pagination.links,
      metadata: Pagination.metadata,
    })
  );

  expect(
    await screen.findByRole("grid", { name: "ServiceInventory-Success" })
  ).toBeInTheDocument();
});

test("ServiceInventory shows next page of instances", async () => {
  const { component, serviceInstancesFetcher } = setup();
  render(component);

  serviceInstancesFetcher.resolve(
    Either.right({
      data: [{ ...ServiceInstance.a, id: "a" }],
      links: { ...Pagination.links, next: "fake-url" },
      metadata: Pagination.metadata,
    })
  );

  expect(
    await screen.findByRole("cell", { name: "IdCell-a" })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Next" }));

  serviceInstancesFetcher.resolve(
    Either.right({
      data: [{ ...ServiceInstance.a, id: "b" }],
      links: Pagination.links,
      metadata: Pagination.metadata,
    })
  );

  expect(
    await screen.findByRole("cell", { name: "IdCell-b" })
  ).toBeInTheDocument();
});

test("GIVEN ResourcesView fetches resources for new instance after instance update", async () => {
  const { component, serviceInstancesFetcher, resourcesFetcher, scheduler } =
    setup();

  render(component);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.a],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  expect(
    await screen.findByRole("grid", { name: "ServiceInventory-Success" })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Details" }));
  fireEvent.click(await screen.findByRole("button", { name: "Resources" }));

  await act(async () => {
    await resourcesFetcher.resolve(Either.right({ data: Resource.listA }));
  });

  expect(
    screen.getByRole("cell", { name: Resource.listA[0].resource_id })
  ).toBeInTheDocument();

  scheduler.executeAll();

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [{ ...ServiceInstance.a, version: 4 }],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });
  await act(async () => {
    await resourcesFetcher.resolve(Either.right({ data: Resource.listA }));
  });

  expect(resourcesFetcher.getInvocations().length).toEqual(3);
  expect(resourcesFetcher.getInvocations()[2][1]).toMatch(
    `/lsm/v1/service_inventory/${ServiceInstance.a.service_entity}/${ServiceInstance.a.id}/resources?current_version=4`
  );
});
