import React from "react";
import { fireEvent, render, screen, act, within } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  StaticSubscriptionController,
  DeferredFetcher,
  Service,
  ServiceInstance,
  Resources,
  Pagination,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  DataManagerImpl,
  ServiceInstancesHookHelper,
  ServiceInstancesStateHelper,
  ResourcesHookHelper,
  ResourcesStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "./ServiceInventory";
import { MemoryRouter } from "react-router-dom";
import userEvent, { specialChars } from "@testing-library/user-event";

function setup() {
  const store = getStoreInstance();

  const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
  const serviceInstancesSubscriptionController = new StaticSubscriptionController();
  const serviceInstancesHelper = new ServiceInstancesHookHelper(
    new DataManagerImpl<"ServiceInstances">(
      serviceInstancesFetcher,
      new ServiceInstancesStateHelper(store)
    ),
    serviceInstancesSubscriptionController
  );

  const resourcesFetcher = new DeferredFetcher<"Resources">();
  const resourcesSubscriptionController = new StaticSubscriptionController();
  const resourcesHelper = new ResourcesHookHelper(
    new DataManagerImpl<"Resources">(
      resourcesFetcher,
      new ResourcesStateHelper(store)
    ),
    resourcesSubscriptionController
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
    serviceInstancesSubscriptionController,
  };
}

test("ServiceInventory shows updated instances", async () => {
  const {
    component,
    serviceInstancesFetcher,
    serviceInstancesSubscriptionController,
  } = setup();
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

  serviceInstancesSubscriptionController.executeAll();

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

  expect(await screen.findByRole("cell", { name: "a" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Next" }));

  serviceInstancesFetcher.resolve(
    Either.right({
      data: [{ ...ServiceInstance.A, id: "b" }],
      links: Pagination.links,
      metadata: Pagination.metadata,
    })
  );

  expect(await screen.findByRole("cell", { name: "b" })).toBeInTheDocument();
});

test("ResourcesView fetches resources for new instance after instance update", async () => {
  const {
    component,
    serviceInstancesFetcher,
    resourcesFetcher,
    serviceInstancesSubscriptionController,
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

  serviceInstancesSubscriptionController.refresh(Service.A.name);

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
    await resourcesFetcher.resolve(Either.right({ data: Resources.B }));
  });

  expect(
    await screen.findByRole("cell", { name: "resource_id_b_1" })
  ).toBeInTheDocument();

  expect(resourcesFetcher.getInvocations().length).toEqual(2);
  expect(resourcesFetcher.getInvocations()[1][1]).toMatch(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/resources?current_version=4"
  );
});

test("GIVEN The Service Inventory WHEN the user filters on state ('creating') THEN only that type of instance is fetched and shown", async () => {
  const store = getStoreInstance();
  const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
  const serviceInstancesSubscriptionController = new StaticSubscriptionController();
  const serviceInstancesHelper = new ServiceInstancesHookHelper(
    new DataManagerImpl<"ServiceInstances">(
      serviceInstancesFetcher,
      new ServiceInstancesStateHelper(store)
    ),
    serviceInstancesSubscriptionController
  );

  const dataProvider = new DataProviderImpl([serviceInstancesHelper]);

  // Render the component
  render(
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

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.A, ServiceInstance.B],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(initialRows.length).toEqual(2);

  const input = await screen.findByPlaceholderText("Select a state...");
  userEvent.click(input);

  const option = await screen.findByRole("option", { name: "creating" });
  await userEvent.click(option);

  expect(serviceInstancesFetcher.getInvocations()[1][1]).toEqual(
    `/lsm/v1/service_inventory/${Service.A.name}?include_deployment_progress=True&limit=20&filter.state=creating&sort=created_at.desc`
  );

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.A],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(rowsAfter.length).toEqual(1);
});

test("GIVEN The Service Inventory WHEN the user filters on id ('a') THEN only 1 instance is shown", async () => {
  const store = getStoreInstance();
  const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
  const serviceInstancesSubscriptionController = new StaticSubscriptionController();
  const serviceInstancesHelper = new ServiceInstancesHookHelper(
    new DataManagerImpl<"ServiceInstances">(
      serviceInstancesFetcher,
      new ServiceInstancesStateHelper(store)
    ),
    serviceInstancesSubscriptionController
  );

  const dataProvider = new DataProviderImpl([serviceInstancesHelper]);

  // Render the component
  render(
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

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.A, ServiceInstance.B],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const filterBar = screen.getByRole("generic", { name: "FilterBar" });

  const picker = within(filterBar).getByRole("button", { name: "State" });
  userEvent.click(picker);

  const id = screen.getByRole("option", { name: "Id" });
  userEvent.click(id);

  const input = screen.getByRole("textbox", { name: "IdFilterInput" });
  userEvent.type(input, `${ServiceInstance.A.id}${specialChars.enter}`);

  expect(serviceInstancesFetcher.getInvocations()[1][1]).toEqual(
    `/lsm/v1/service_inventory/${Service.A.name}?include_deployment_progress=True&limit=20&filter.id=${ServiceInstance.A.id}&sort=created_at.desc`
  );

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.A],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(rowsAfter.length).toEqual(1);
});
