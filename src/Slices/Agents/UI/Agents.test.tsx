import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, Maybe, RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  KeycloakAuthHelper,
  QueryManagerResolver,
  CommandManagerResolver,
} from "@/Data";
import {
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
  EnvironmentDetails,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import * as AgentsMock from "@S/Agents/Core/Mock";
import { Page } from "./Page";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler),
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper),
  );
  dependencies.environmentModifier.setEnvironment("env");

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

  return { component, apiHelper, scheduler, store };
}

test("AgentsView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "AgentsView-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    }),
  );

  expect(
    await screen.findByRole("generic", { name: "AgentsView-Empty" }),
  ).toBeInTheDocument();
});

test("AgentsView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "AgentsView-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "AgentsView-Failed" }),
  ).toBeInTheDocument();
});

test("AgentsView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "AgentsView-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right(AgentsMock.response));

  expect(
    await screen.findByRole("grid", { name: "AgentsView-Success" }),
  ).toBeInTheDocument();
});

test("When using the name filter then only the matching agents should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  expect(initialRows).toHaveLength(6);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" },
      ),
    );
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", { name: words("attribute.name") }),
    );
  });

  const input = screen.getByPlaceholderText(
    words("home.filters.env.placeholder"),
  );
  await act(async () => {
    await userEvent.click(input);
  });

  await act(async () => {
    await userEvent.type(input, "internal{enter}");
  });

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/agents?limit=20&filter.name=internal&sort=name.asc`,
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...AgentsMock.response,
        data: AgentsMock.response.data.slice(0, 3),
      }),
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
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  expect(initialRows).toHaveLength(6);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" },
      ),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", { name: words("agent.tests.processName") }),
    );
  });

  const input = screen.getByPlaceholderText(
    words("agents.filters.processName.placeholder"),
  );
  await act(async () => {
    await userEvent.click(input);
  });

  await act(async () => {
    await userEvent.type(input, "internal{enter}");
  });

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/agents?limit=20&filter.process_name=internal&sort=name.asc`,
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...AgentsMock.response,
        data: AgentsMock.response.data.slice(0, 3),
      }),
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
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  expect(initialRows).toHaveLength(6);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" },
      ),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", { name: words("agent.tests.status") }),
    );
  });

  const input = screen.getByPlaceholderText(
    words("agents.filters.status.placeholder"),
  );
  await act(async () => {
    await userEvent.click(input);
  });

  const option = await screen.findByRole("option", {
    name: words("agent.tests.up"),
  });
  await act(async () => {
    await userEvent.click(option);
  });

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/agents?limit=20&filter.status=up&sort=name.asc`,
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...AgentsMock.response,
        data: AgentsMock.response.data.slice(0, 3),
      }),
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
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  const input = screen.getByPlaceholderText(
    words("agents.filters.name.placeholder"),
  );
  await act(async () => {
    await userEvent.click(input);
  });
  await act(async () => {
    await userEvent.type(input, "aws{enter}");
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  const pauseAgentButton = await within(rows[0]).findByRole("button", {
    name: words("agents.actions.pause"),
  });

  await act(async () => {
    await userEvent.click(pauseAgentButton);
  });

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
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(4);
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("Given the Agents view with filters, When unpausing an agent, then the correct request is fired", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  const input = screen.getByPlaceholderText(
    words("agents.filters.name.placeholder"),
  );
  await act(async () => {
    await userEvent.click(input);
  });
  await act(async () => {
    await userEvent.type(input, "bru{enter}");
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  const unpauseAgentButton = await within(rows[1]).findByRole("button", {
    name: words("agents.actions.unpause"),
  });

  await act(async () => {
    await userEvent.click(unpauseAgentButton);
  });

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
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(4);
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("Given the Agents view When pausing an agent results in an error, then the error is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  const pauseAgentButton = await within(rows[0]).findByRole("button", {
    name: words("agents.actions.pause"),
  });

  await act(async () => {
    await userEvent.click(pauseAgentButton);
  });
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
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });
  expect(await screen.findByText("something happened")).toBeVisible();
});

test("Given the Agents view with the environment halted, When setting keep_paused_on_resume on an agent, Then the correct request is fired", async () => {
  const { component, apiHelper, store } = setup();
  store.dispatch.environment.setEnvironmentDetailsById({
    id: "env",
    value: RemoteData.success({ ...EnvironmentDetails.halted, id: "env" }),
  });
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  const onResumeToggle = await screen.findByRole("checkbox", {
    name: "aws-on-resume-toggle",
  });
  expect(onResumeToggle).toBeVisible();
  expect(onResumeToggle).toBeChecked();
  await act(async () => {
    await userEvent.click(onResumeToggle);
  });

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/agent/aws/keep_paused_on_resume",
    body: null,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    environment: "env",
    url: "/api/v2/agents?limit=20&sort=name.asc",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("Given the Agents view with the environment halted, When setting unpause_on_resume on an agent, Then the correct request is fired", async () => {
  const { component, apiHelper, store } = setup();
  store.dispatch.environment.setEnvironmentDetailsById({
    id: "env",
    value: RemoteData.success({ ...EnvironmentDetails.halted, id: "env" }),
  });
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  const onResumeToggle = await screen.findByRole("checkbox", {
    name: "ecx-on-resume-toggle",
  });
  expect(onResumeToggle).toBeVisible();
  expect(onResumeToggle).not.toBeChecked();
  await act(async () => {
    await userEvent.click(onResumeToggle);
  });

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/agent/ecx/unpause_on_resume",
    body: null,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    environment: "env",
    url: "/api/v2/agents?limit=20&sort=name.asc",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });
  expect(apiHelper.pendingRequests).toHaveLength(0);
});
