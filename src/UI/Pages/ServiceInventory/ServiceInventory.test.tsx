import React from "react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  Service,
  ServiceInstance,
  InstanceResource,
  Pagination,
  StaticScheduler,
  DynamicQueryManagerResolver,
  DynamicCommandManagerResolver,
  MockEnvironmentModifier,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  InstanceResourcesQueryManager,
  InstanceResourcesStateHelper,
  TriggerInstanceUpdateCommandManager,
  AttributeResultConverterImpl,
  CommandResolverImpl,
  DeleteInstanceCommandManager,
  BaseApiHelper,
  InstanceDeleter,
  TriggerInstanceUpdatePatcher,
  KeycloakAuthHelper,
  TriggerSetStateCommandManager,
  SetStatePoster,
  getStoreInstance,
} from "@/Data";
import { ServiceInventory } from "./ServiceInventory";
import { MemoryRouter } from "react-router-dom";
import { UrlManagerImpl } from "@/UI/Utils";

function setup(service = Service.a) {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
  const serviceInstancesHelper = new ServiceInstancesQueryManager(
    serviceInstancesFetcher,
    new ServiceInstancesStateHelper(store, service.environment),
    scheduler,
    service.environment
  );

  const resourcesFetcher = new DeferredFetcher<"InstanceResources">();
  const resourcesHelper = new InstanceResourcesQueryManager(
    resourcesFetcher,
    new InstanceResourcesStateHelper(store),
    scheduler,
    service.environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([serviceInstancesHelper, resourcesHelper])
  );

  const urlManager = new UrlManagerImpl("", service.environment);

  const triggerUpdateCommandManager = new TriggerInstanceUpdateCommandManager(
    new TriggerInstanceUpdatePatcher(new BaseApiHelper(), "env1"),
    new AttributeResultConverterImpl()
  );

  const deleteCommandManager = new DeleteInstanceCommandManager(
    new InstanceDeleter(new BaseApiHelper(), "env1")
  );

  const setStateCommandManager = new TriggerSetStateCommandManager(
    new KeycloakAuthHelper(),
    new SetStatePoster(new BaseApiHelper(), "env1")
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      triggerUpdateCommandManager,
      deleteCommandManager,
      setStateCommandManager,
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          queryResolver,
          urlManager,
          commandResolver,
          environmentModifier: new MockEnvironmentModifier(),
        }}
      >
        <StoreProvider store={store}>
          <ServiceInventory serviceName={service.name} service={service} />
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
    await resourcesFetcher.resolve(
      Either.right({ data: InstanceResource.listA })
    );
  });

  expect(
    screen.getByRole("cell", { name: InstanceResource.listA[0].resource_id })
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
    await resourcesFetcher.resolve(
      Either.right({ data: InstanceResource.listA })
    );
  });

  expect(resourcesFetcher.getInvocations().length).toEqual(3);
  expect(resourcesFetcher.getInvocations()[2][1]).toMatch(
    `/lsm/v1/service_inventory/${ServiceInstance.a.service_entity}/${ServiceInstance.a.id}/resources?current_version=4`
  );
});

test("ServiceInventory shows instance summary chart", async () => {
  const { component } = setup(Service.withInstanceSummary);
  render(component);

  expect(
    await screen.findByRole("img", { name: "Number of instances by label" })
  ).toBeInTheDocument();
});
