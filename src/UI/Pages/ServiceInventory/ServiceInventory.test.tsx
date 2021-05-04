import React from "react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  Service,
  ServiceInstance,
  Resources,
  Pagination,
  StaticScheduler,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  ServiceInstancesDataManager,
  ServiceInstancesStateHelper,
  ResourcesDataManager,
  ResourcesStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "./ServiceInventory";
import { MemoryRouter } from "react-router-dom";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
  const serviceInstancesHelper = new ServiceInstancesDataManager(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store, Service.A.environment),
    scheduler,
    Service.A.environment
  );

  const resourcesFetcher = new DeferredFetcher<"Resources">();
  const resourcesHelper = new ResourcesDataManager(
    resourcesFetcher,
    new ResourcesStateHelper(store),
    scheduler,
    Service.A.environment
  );

  const dataProvider = new DataProviderImpl([
    serviceInstancesHelper,
    resourcesHelper,
  ]);

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ dataProvider }}>
        <StoreProvider store={store}>
          <ServiceInventory
            serviceName={Service.A.name}
            environmentId={Service.A.environment}
            service={Service.A}
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
      data: [ServiceInstance.A],
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
      data: [ServiceInstance.A],
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
      data: [{ ...ServiceInstance.A, id: "a" }],
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
      data: [{ ...ServiceInstance.A, id: "b" }],
      links: Pagination.links,
      metadata: Pagination.metadata,
    })
  );

  expect(
    await screen.findByRole("cell", { name: "IdCell-b" })
  ).toBeInTheDocument();
});

test("GIVEN ResourcesView fetches resources for new instance after instance update", async () => {
  const {
    component,
    serviceInstancesFetcher,
    resourcesFetcher,
    scheduler,
  } = setup();

  render(component);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.A],
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
    await resourcesFetcher.resolve(Either.right({ data: Resources.A }));
  });

  expect(
    screen.getByRole("cell", { name: "resource_id_a_1" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [{ ...ServiceInstance.A, version: 4 }],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });
  await act(async () => {
    await resourcesFetcher.resolve(Either.right({ data: Resources.A }));
  });

  expect(resourcesFetcher.getInvocations().length).toEqual(3);
  expect(resourcesFetcher.getInvocations()[2][1]).toMatch(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/resources?current_version=4"
  );
});
