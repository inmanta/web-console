import React from "react";
import { MemoryRouter, useLocation } from "react-router";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  BaseApiHelper,
  DeleteInstanceCommandManager,
  DestroyInstanceCommandManager,
  InstanceResourcesQueryManager,
  InstanceResourcesStateHelper,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  TriggerForceStateCommandManager,
  TriggerSetStateCommandManager,
} from "@/Data";
import { defaultAuthContext } from "@/Data/Auth/AuthContext";
import { TriggerInstanceUpdateCommandManager } from "@/Slices/EditInstance/Data";
import {
  Row,
  StaticScheduler,
  dependencies,
  DeferredApiHelper,
  DynamicCommandManagerResolverImpl,
  DynamicQueryManagerResolverImpl,
  Service,
} from "@/Test";
import {
  DependencyProvider,
  EnvironmentHandlerImpl,
  EnvironmentModifierImpl,
} from "@/UI/Dependency";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { InventoryTable } from "./InventoryTable";
import { InventoryTablePresenter } from "./Presenters";

const dummySetter = () => {
  return;
};

const tablePresenterWithIdentity = () =>
  new InventoryTablePresenter("service_id", "Service ID");

function setup(expertMode = false, setSortFn: (props) => void = dummySetter) {
  const store = getStoreInstance();

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
          enable_lsm_expert_mode: expertMode,
        },
      },
    ]),
  );

  store.dispatch.environment.setSettingsData({
    environment: "aaa",
    value: RemoteData.success({
      settings: {
        enable_lsm_expert_mode: expertMode,
      },
      definition: {},
    }),
  });
  store.dispatch.environment.setEnvironmentDetailsById({
    id: "aaa",
    value: RemoteData.success({
      id: "aaa",
      name: "env-a",
      project_id: "ppp",
      repo_branch: "branch",
      repo_url: "repo",
      projectName: "project",
      halted: false,
      settings: {
        enable_lsm_expert_mode: expertMode,
      },
    }),
  });

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
  const environmentModifier = EnvironmentModifierImpl();

  environmentModifier.setEnvironment("aaa");
  const component = (
    <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentModifier,
          environmentHandler,
        }}
      >
        <StoreProvider store={store}>
          <ModalProvider>
            <InventoryTable
              rows={[Row.a]}
              tablePresenter={tablePresenterWithIdentity()}
              service={Service.withIdentity}
              setSort={setSortFn}
              sort={{ name: "created_at", order: "desc" }}
            />
          </ModalProvider>
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return component;
}

test("ServiceInventory shows service identity if it's defined", async () => {
  const component = setup();

  render(component);

  expect(await screen.findByText("Service ID")).toBeVisible();

  expect(await screen.findByText("instance1")).toBeVisible();
});

test("ServiceInventory shows sorting buttons for sortable columns", async () => {
  const component = setup();

  render(component);
  expect(await screen.findByRole("button", { name: /state/i })).toBeVisible();
  expect(await screen.findByRole("button", { name: /created/i })).toBeVisible();
  expect(await screen.findByRole("button", { name: /updated/i })).toBeVisible();
  expect(
    screen.queryByRole("button", { name: /attributes/i }),
  ).not.toBeInTheDocument();
});

test("ServiceInventory sets sorting parameters correctly on click", async () => {
  let sort;
  const expertMode = false;
  const component = setup(expertMode, (value) => (sort = value));

  render(component);
  const stateButton = await screen.findByRole("button", { name: /state/i });

  expect(stateButton).toBeVisible();

  await userEvent.click(stateButton);

  expect(sort.name).toEqual("state");
  expect(sort.order).toEqual("asc");
});

describe("Actions", () => {
  it("Should have 7 options in total", async () => {
    const component = setup();

    render(component);

    const menuToggle = await screen.findByRole("button", {
      name: "row actions toggle",
    });

    await userEvent.click(menuToggle);

    const options = await screen.findAllByRole("menuitem");

    expect(options).toHaveLength(7);
  });
});
