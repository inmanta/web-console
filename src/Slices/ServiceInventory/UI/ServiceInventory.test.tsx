import React, { act } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
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
  TriggerSetStateCommandManager,
  getStoreInstance,
  TriggerForceStateCommandManager,
  DestroyInstanceCommandManager,
} from "@/Data";
import { defaultAuthContext } from "@/Data/Auth/AuthContext";
import {
  Service,
  ServiceInstance,
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
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TriggerInstanceUpdateCommandManager } from "@S/EditInstance/Data";
import { Chart } from "./Components";
import { ServiceInventory } from "./ServiceInventory";

expect.extend(toHaveNoViolations);

function setup(service = Service.a, pageSize = "") {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();

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
    defaultAuthContext,
    apiHelper,
  );

  const deleteCommandManager = DeleteInstanceCommandManager(apiHelper);

  const setStateCommandManager = TriggerSetStateCommandManager(
    defaultAuthContext,
    BaseApiHelper(undefined, defaultAuthContext),
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
          <ModalProvider>
            <Page>
              <ServiceInventory
                serviceName={service.name}
                service={service}
                intro={<Chart summary={service.instance_summary} />}
              />
            </Page>
          </ModalProvider>
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

test("ServiceInventory shows updated instances", async () => {
  const { component, apiHelper, scheduler } = setup();

  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceInventory-Loading" }),
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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("ServiceInventory shows error with retry", async () => {
  const { component, apiHelper } = setup();

  render(component);

  apiHelper.resolve(Either.left("fake error"));

  expect(
    await screen.findByRole("region", { name: "ServiceInventory-Failed" }),
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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
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

  await userEvent.click(
    screen.getByRole("button", { name: "Go to next page" }),
  );

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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("ServiceInventory shows instance summary chart", async () => {
  const { component } = setup(Service.withInstanceSummary);

  render(component);

  expect(
    await screen.findByRole("img", { name: words("catalog.summary.title") }),
  ).toBeInTheDocument();
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

  await userEvent.click(
    screen.getByRole("button", { name: "AddInstanceToggle" }),
  );

  expect(await screen.findByText("Add in Composer")).toBeEnabled();

  const menuToggle = await screen.findByRole("button", {
    name: "row actions toggle",
  });

  await userEvent.click(menuToggle);

  expect(await screen.findByText("Edit in Composer")).toBeEnabled();

  expect(screen.queryByText("Show in Composer")).toBeEnabled();
});

test("ServiceInventory shows only button to display instance in the composer for non-root", async () => {
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

  await userEvent.click(
    screen.getByRole("button", { name: "AddInstanceToggle" }),
  );

  expect(screen.getByText("Add in Composer")).toBeInTheDocument();

  const menuToggle = await screen.findByRole("button", {
    name: "row actions toggle",
  });

  await userEvent.click(menuToggle);

  expect(await screen.findByText("Show in Composer")).toBeEnabled();

  expect(screen.getByText("Edit in Composer")).toBeInTheDocument();
});

test("GIVEN ServiceInventory WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
  const { component, apiHelper } = setup({ ...Service.a, owner: "owner" });

  render(component);

  //mock that response has more than one site
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: [{ ...ServiceInstance.a, id: "a" }],
        links: { ...Pagination.links },
        metadata: {
          total: 23,
          before: 0,
          after: 3,
          page_size: 20,
        },
      }),
    );
  });

  const nextPageButton = screen.getByLabelText("Go to next page");

  expect(nextPageButton).toBeEnabled();

  await userEvent.click(nextPageButton);

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&sort=created_at.desc)/);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: [{ ...ServiceInstance.a, id: "a" }],
        links: { ...Pagination.links },
        metadata: {
          total: 23,
          before: 20,
          after: 0,
          page_size: 20,
        },
      }),
    );
  });

  //sort on the second page
  const columnheader = screen.getByRole("columnheader", {
    name: /state/i,
  });

  await userEvent.click(
    within(columnheader).getByRole("button", {
      name: /state/i,
    }),
  );

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
  // we are asserting on the second request as the first request is for the updated sorting event, and second is chained to back to the first page with still correct sorting
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(/(&sort=state.asc)/);
});
