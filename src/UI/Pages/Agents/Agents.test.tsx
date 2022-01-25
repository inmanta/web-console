import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, Maybe } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  GetAgentsQueryManager,
  GetAgentsStateHelper,
  CommandResolverImpl,
  DeployCommandManager,
  RepairCommandManager,
  ControlAgentCommandManager,
  GetAgentsUpdater,
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
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const stateHelper = new GetAgentsStateHelper(store);
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetAgentsQueryManager(
        apiHelper,
        new GetAgentsStateHelper(store),
        scheduler
      ),
    ])
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new DeployCommandManager(apiHelper),
      new RepairCommandManager(apiHelper),
      new ControlAgentCommandManager(
        apiHelper,
        new GetAgentsUpdater(stateHelper, apiHelper)
      ),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
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

test("Given the Agents view with filters, When pausing an agent, then the correct request is fired", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Agents.response));
  });

  const input = screen.getByPlaceholderText("Filter by name");
  userEvent.click(input);
  userEvent.type(input, "aws{enter}");

  await act(async () => {
    await apiHelper.resolve(Either.right(Agents.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  const pauseAgentButton = await within(rows[0]).findByRole("button", {
    name: "Pause",
  });

  userEvent.click(pauseAgentButton);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/agent/aws/pause",
    body: null,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.resolvedRequests).toHaveLength(3);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    environment: "env",
    url: "/api/v2/agents?limit=20&filter.name=aws&sort=name.asc",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(Agents.response));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(4);
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("Given the Agents view with filters, When unpausing an agent, then the correct request is fired", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Agents.response));
  });

  const input = screen.getByPlaceholderText("Filter by name");
  userEvent.click(input);
  userEvent.type(input, "bru{enter}");

  await act(async () => {
    await apiHelper.resolve(Either.right(Agents.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  const unpauseAgentButton = await within(rows[1]).findByRole("button", {
    name: "Unpause",
  });

  userEvent.click(unpauseAgentButton);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/agent/bru-23-r321/unpause",
    body: null,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.resolvedRequests).toHaveLength(3);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    environment: "env",
    url: "/api/v2/agents?limit=20&filter.name=bru&sort=name.asc",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(Agents.response));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(4);
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("Given the Agents view When pausing an agent results in an error, then the error is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Agents.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  const pauseAgentButton = await within(rows[0]).findByRole("button", {
    name: "Pause",
  });

  userEvent.click(pauseAgentButton);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/agent/aws/pause",
    body: null,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.some("something happened"));
    await apiHelper.resolve(Either.right(Agents.response));
  });
  expect(await screen.findByText("something happened")).toBeVisible();
});
