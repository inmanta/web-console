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
} from "@/Data";
import {
  Row,
  tablePresenter,
  tablePresenterWithIdentity,
  StaticScheduler,
  dependencies,
  DeferredApiHelper,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { InventoryTable } from "./InventoryTable";

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
            tablePresenter={tablePresenter}
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
            tablePresenter={tablePresenter}
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

function setup(setSortFn: (props) => void = dummySetter) {
  const store = getStoreInstance();
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
    <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
      <DependencyProvider
        dependencies={{ ...dependencies, environmentHandler }}
      >
        <StoreProvider store={store}>
          <InventoryTable
            rows={[Row.a]}
            tablePresenter={tablePresenterWithIdentity}
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
  const component = setup((value) => (sort = value));
  render(component);
  const stateButton = await screen.findByRole("button", { name: /state/i });
  expect(stateButton).toBeVisible();
  await act(async () => {
    await userEvent.click(stateButton);
  });
  expect(sort.name).toEqual("state");
  expect(sort.order).toEqual("asc");
});
