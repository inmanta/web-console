import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  InstanceResourcesQueryManager,
  InstanceResourcesStateHelper,
  CommandResolverImpl,
  DeleteInstanceCommandManager,
  BaseApiHelper,
  KeycloakAuthHelper,
  TriggerSetStateCommandManager,
  getStoreInstance,
  TriggerForceStateCommandManager,
  DestroyInstanceCommandManager,
} from "@/Data";
import {
  Service,
  ServiceInstance,
  InstanceResource,
  Pagination,
  StaticScheduler,
  DynamicQueryManagerResolverImpl,
  DynamicCommandManagerResolverImpl,
  MockEnvironmentModifier,
  DeferredApiHelper,
  dependencies,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { TriggerInstanceUpdateCommandManager } from "@S/EditInstance/Data";
import { Chart } from "./Components";
import { ServiceInventory } from "./ServiceInventory";

function setup(service = Service.a, pageSize = "") {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const serviceInstancesHelper = ServiceInstancesQueryManager(
    apiHelper,
    ServiceInstancesStateHelper(store),
    scheduler,
  );

  const resourcesHelper = InstanceResourcesQueryManager(
    apiHelper,
    InstanceResourcesStateHelper(store),
    ServiceInstancesStateHelper(store),
    scheduler,
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      serviceInstancesHelper,
      resourcesHelper,
    ]),
  );

  const triggerUpdateCommandManager =
    TriggerInstanceUpdateCommandManager(apiHelper);
  const triggerDestroyInstanceCommandManager =
    DestroyInstanceCommandManager(apiHelper);
  const triggerforceStateCommandManager = TriggerForceStateCommandManager(
    authHelper,
    apiHelper,
  );

  const deleteCommandManager = DeleteInstanceCommandManager(apiHelper);

  const setStateCommandManager = TriggerSetStateCommandManager(
    authHelper,
    new BaseApiHelper(),
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolverImpl([
      triggerUpdateCommandManager,
      triggerforceStateCommandManager,
      triggerDestroyInstanceCommandManager,
      deleteCommandManager,
      setStateCommandManager,
    ]),
  );
  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager,
  );
  store.dispatch.environment.setEnvironments(
    RemoteData.success([
      {
        id: "aaa",
        name: "env-a",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
        settings: {
          enable_lsm_expert_mode: false,
        },
      },
    ]),
  );
  const component = (
    <MemoryRouter initialEntries={[`/?env=aaa${pageSize}`]}>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentModifier: new MockEnvironmentModifier(),
          environmentHandler,
        }}
      >
        <StoreProvider store={store}>
          <ServiceInventory
            serviceName={service.name}
            service={service}
            intro={<Chart summary={service.instance_summary} />}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
    scheduler,
  };
}

jest.mock("@/UI/Utils/useFeatures");

test("ServiceInventory shows updated instances", async () => {
  const { component, apiHelper, scheduler } = setup();

  render(component);

  expect(
    await screen.findByRole("generic", { name: "ServiceInventory-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      links: Pagination.links,
      metadata: Pagination.metadata,
    }),
  );

  expect(
    await screen.findByRole("generic", { name: "ServiceInventory-Empty" }),
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(
    Either.right({
      data: [ServiceInstance.a],
      links: Pagination.links,
      metadata: Pagination.metadata,
    }),
  );

  expect(
    await screen.findByRole("grid", { name: "ServiceInventory-Success" }),
  ).toBeInTheDocument();
});

test("ServiceInventory shows error with retry", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(Either.left("fake error"));

  expect(
    await screen.findByRole("generic", { name: "ServiceInventory-Failed" }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Retry" }));

  apiHelper.resolve(
    Either.right({
      data: [ServiceInstance.a],
      links: Pagination.links,
      metadata: Pagination.metadata,
    }),
  );

  expect(
    await screen.findByRole("grid", { name: "ServiceInventory-Success" }),
  ).toBeInTheDocument();
});

test("ServiceInventory shows next page of instances", async () => {
  const { component, apiHelper } = setup(
    Service.a,
    "&state.Inventory.pageSize=10",
  );
  render(component);

  apiHelper.resolve(
    Either.right({
      data: [{ ...ServiceInstance.a, id: "a" }],
      links: { ...Pagination.links },
      metadata: Pagination.metadata,
    }),
  );

  expect(
    await screen.findByRole("cell", { name: "IdCell-a" }),
  ).toBeInTheDocument();

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "Go to next page" }),
    );
  });

  apiHelper.resolve(
    Either.right({
      data: [{ ...ServiceInstance.a, id: "b" }],
      links: Pagination.links,
      metadata: Pagination.metadata,
    }),
  );

  expect(
    await screen.findByRole("cell", { name: "IdCell-b" }),
  ).toBeInTheDocument();
});

test("GIVEN ResourcesView fetches resources for new instance after instance update", async () => {
  const { component, apiHelper, scheduler } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [ServiceInstance.a],
        links: Pagination.links,
        metadata: Pagination.metadata,
      }),
    );
  });

  expect(
    await screen.findByRole("grid", { name: "ServiceInventory-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "Details" }));
  });
  await act(async () => {
    await userEvent.click(
      await screen.findByRole("tab", {
        name: words("inventory.tabs.resources"),
      }),
    );
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: InstanceResource.listA }));
  });

  expect(
    screen.getByRole("cell", { name: "[resource_id_a]" }),
  ).toBeInTheDocument();

  scheduler.executeAll();

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [{ ...ServiceInstance.a, version: 4 }],
        links: Pagination.links,
        metadata: Pagination.metadata,
      }),
    );
  });

  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/lsm/v1/service_inventory/${ServiceInstance.a.service_entity}/${ServiceInstance.a.id}/resources?current_version=3`,
  );
  await act(async () => {
    await apiHelper.resolve(Either.left({ message: "Conflict", status: 409 }));
  });

  expect(apiHelper.pendingRequests[0].url).toMatch(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a",
  );
  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: { ...ServiceInstance.a, version: 4 },
      }),
    );
  });

  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/lsm/v1/service_inventory/${ServiceInstance.a.service_entity}/${ServiceInstance.a.id}/resources?current_version=4`,
  );
});

test("ServiceInventory shows instance summary chart", async () => {
  const { component } = setup(Service.withInstanceSummary);
  render(component);

  expect(
    await screen.findByRole("img", { name: words("catalog.summary.title") }),
  ).toBeInTheDocument();
});

test("ServiceInventory shows disabled composer buttons for non-root instances ", async () => {
  const { component, apiHelper } = setup({ ...Service.a, owner: "owner" });
  render(component);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: [{ ...ServiceInstance.a, id: "a" }],
        links: { ...Pagination.links },
        metadata: Pagination.metadata,
      }),
    );
  });

  expect(screen.queryByRole("Add in Composer")).not.toBeInTheDocument();

  const menuToggle = await screen.findByRole("button", {
    name: "row actions toggle",
  });
  await act(async () => {
    await userEvent.click(menuToggle);
  });

  const button = screen.queryByRole("menuitem", {
    name: "Edit in Composer",
  });
  expect(button).not.toBeInTheDocument();
});

test("ServiceInventory shows enabled composer buttons for root instances ", async () => {
  const { component, apiHelper } = setup(Service.a);
  render(component);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: [{ ...ServiceInstance.a, id: "a" }],
        links: { ...Pagination.links },
        metadata: Pagination.metadata,
      }),
    );
  });

  expect(await screen.findByText("Add in Composer")).toBeEnabled();

  const menuToggle = await screen.findByRole("button", {
    name: "row actions toggle",
  });
  await act(async () => {
    await userEvent.click(menuToggle);
  });
  expect(await screen.findByText("Edit in Composer")).toBeEnabled();
});
