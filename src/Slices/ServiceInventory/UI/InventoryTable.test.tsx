import React from "react";
import { MemoryRouter, useLocation } from "react-router";
import { render, screen, within, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  QueryManagerResolver,
  CommandResolverImpl,
  BaseApiHelper,
  DeleteInstanceCommandManager,
  DestroyInstanceCommandManager,
  InstanceResourcesQueryManager,
  InstanceResourcesStateHelper,
  KeycloakAuthHelper,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  TriggerForceStateCommandManager,
  TriggerSetStateCommandManager,
} from "@/Data";
import { TriggerInstanceUpdateCommandManager } from "@/Slices/EditInstance/Data";
import {
  Row,
  tablePresenter,
  tablePresenterWithIdentity,
  StaticScheduler,
  dependencies,
  DeferredApiHelper,
  ServiceInstance,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
} from "@/Test";
import { withIdentity } from "@/Test/Data/Service";
import { words } from "@/UI";
import {
  DependencyProvider,
  EnvironmentHandlerImpl,
  EnvironmentModifierImpl,
} from "@/UI/Dependency";
import { InventoryTable } from "./InventoryTable";
import { InstanceActionPresenter } from "./Presenters";

const dummySetter = () => {
  return;
};

test("InventoryTable can be expanded", async () => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(
      store,
      new DeferredApiHelper(),
      new StaticScheduler(),
      new StaticScheduler(),
    ),
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

  render(
    <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
      <DependencyProvider
        dependencies={{ ...dependencies, queryResolver, environmentHandler }}
      >
        <StoreProvider store={store}>
          <InventoryTable
            rows={[Row.a, Row.b]}
            tablePresenter={tablePresenter()}
            setSort={dummySetter}
            sort={{ name: "created_at", order: "desc" }}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>,
  );
  const testid = `details_${Row.a.id.short}`;

  // Act
  const expandCell = screen.getByLabelText(`expand-button-${Row.a.id.short}`);

  await act(async () => {
    await userEvent.click(within(expandCell).getByRole("button"));
  });
  // Assert
  expect(await screen.findByTestId(testid)).toBeVisible();
});

test("ServiceInventory can show resources for instance", async () => {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(
      store,
      apiHelper,
      new StaticScheduler(),
      new StaticScheduler(),
    ),
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

  render(
    <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
      <DependencyProvider
        dependencies={{ ...dependencies, queryResolver, environmentHandler }}
      >
        <StoreProvider store={store}>
          <InventoryTable
            rows={[Row.a, Row.b]}
            tablePresenter={tablePresenter()}
            setSort={dummySetter}
            sort={{ name: "created_at", order: "desc" }}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>,
  );

  const expandCell = screen.getByLabelText(`expand-button-${Row.a.id.short}`);
  await act(async () => {
    await userEvent.click(within(expandCell).getByRole("button"));
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("tab", { name: words("inventory.tabs.resources") }),
    );
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: [
          {
            resource_id: "[resource_id_1],v=1",
            resource_state: "resource_state",
          },
        ],
      }),
    );
  });

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Success" }),
  ).toBeInTheDocument();

  expect(screen.getByText("[resource_id_1]")).toBeInTheDocument();
});

jest.mock("@/UI/Utils/useFeatures");

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
    new DynamicQueryManagerResolver([serviceInstancesHelper, resourcesHelper]),
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
    new DynamicCommandManagerResolver([
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

  const instances = [ServiceInstance.a];
  const actionPresenter = new InstanceActionPresenter(instances, withIdentity);
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
          <InventoryTable
            rows={[Row.a]}
            tablePresenter={tablePresenterWithIdentity(actionPresenter)}
            setSort={setSortFn}
            sort={{ name: "created_at", order: "desc" }}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return component;
}

test("ServiceInventory shows service identity if it's defined", async () => {
  const component = setup();
  render(component);

  expect(await screen.findByText("Order ID")).toBeVisible();

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
  await act(async () => {
    await userEvent.click(stateButton);
  });
  expect(sort.name).toEqual("state");
  expect(sort.order).toEqual("asc");
});

describe("Actions", () => {
  it("Should have expert options in expert-mode in dropdown and trigger dialog when forcing state", async () => {
    const expertMode = true;
    const component = setup(expertMode);
    render(component);

    const menuToggle = await screen.findByRole("button", {
      name: "row actions toggle",
    });
    await act(async () => {
      await userEvent.click(menuToggle);
    });

    const options = await screen.findAllByRole("menuitem");
    expect(options).toHaveLength(16);

    await act(async () => {
      await userEvent.click(await screen.findByTestId("forceState"));
      await userEvent.click(screen.getByText("rejected"));
    });

    expect(await screen.findByRole("dialog")).toBeVisible();
  });

  it("Shouldn't have expert options if not in expert-mode in dropdown", async () => {
    const component = setup();
    render(component);

    const menuToggle = await screen.findByRole("button", {
      name: "row actions toggle",
    });
    await act(async () => {
      await userEvent.click(menuToggle);
    });

    const options = await screen.findAllByRole("menuitem");
    expect(options).toHaveLength(9);
  });
});
