import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  GetAgentsQueryManager,
  GetAgentsStateHelper,
  CommandResolverImpl,
  DeployCommandManager,
  RepairCommandManager,
} from "@/Data";
import {
  DynamicQueryManagerResolver,
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
  Agents,
  DynamicCommandManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const environment = "environment";
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetAgentsQueryManager(
        apiHelper,
        new GetAgentsStateHelper(store, environment),
        scheduler
      ),
    ])
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new DeployCommandManager(apiHelper, environment),
      new RepairCommandManager(apiHelper, environment),
    ])
  );

  const routeManager = new PrimaryRouteManager("");

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          routeManager,
          commandResolver,
        }}
      >
        <StoreProvider store={store}>
          <Page />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("AgentsView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "AgentsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "AgentsView-Empty" })
  ).toBeInTheDocument();
});

test("AgentsView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "AgentsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "AgentsView-Failed" })
  ).toBeInTheDocument();
});

test("AgentsView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "AgentsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right(Agents.response));

  expect(
    await screen.findByRole("grid", { name: "AgentsView-Success" })
  ).toBeInTheDocument();
});

test("When using the name filter then only the matching agents should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Agents.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  expect(initialRows).toHaveLength(6);

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Name" }));

  const input = screen.getByPlaceholderText("Filter by name");
  userEvent.click(input);

  userEvent.type(input, "internal{enter}");

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/agents?limit=20&filter.name=internal&sort=name.asc`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Agents.response,
        data: Agents.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  expect(rowsAfter).toHaveLength(3);
});

test("When using the process name filter then only the matching agents should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Agents.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  expect(initialRows).toHaveLength(6);

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Process Name" }));

  const input = screen.getByPlaceholderText("Filter by process name");
  userEvent.click(input);

  userEvent.type(input, "internal{enter}");

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/agents?limit=20&filter.process_name=internal&sort=name.asc`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Agents.response,
        data: Agents.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  expect(rowsAfter).toHaveLength(3);
});

test("When using the status filter with the 'up' option then the agents in the 'up' state should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Agents.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  expect(initialRows).toHaveLength(6);

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Status" }));

  const input = screen.getByPlaceholderText("Select status...");
  userEvent.click(input);

  const option = await screen.findByRole("option", { name: "up" });
  await userEvent.click(option);

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/agents?limit=20&filter.status=up&sort=name.asc`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Agents.response,
        data: Agents.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  expect(rowsAfter).toHaveLength(3);
});
