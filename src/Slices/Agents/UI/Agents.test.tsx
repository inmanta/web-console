import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either, Maybe, RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  QueryManagerResolverImpl,
  CommandManagerResolverImpl,
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
expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup () {
  const apiHelper = new DeferredApiHelper();

  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper),
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
    await screen.findByRole("region", { name: "AgentsView-Loading" }),
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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("AgentsView shows failed table", async () => {
  const { component, apiHelper } = setup();

  render(component);

  expect(
    await screen.findByRole("region", { name: "AgentsView-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("region", { name: "AgentsView-Failed" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("AgentsView shows success table", async () => {
  const { component, apiHelper } = setup();

  render(component);

  expect(
    await screen.findByRole("region", { name: "AgentsView-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right(AgentsMock.response));

  expect(
    await screen.findByRole("grid", { name: "AgentsView-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
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

  await userEvent.click(
    within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" },
    ),
  );

  await userEvent.click(
    screen.getByRole("option", { name: words("attribute.name") }),
  );

  const input = screen.getByPlaceholderText(
    words("home.filters.env.placeholder"),
  );

  await userEvent.type(input, "internal{enter}");

  expect(apiHelper.pendingRequests[0].url).toEqual(
    "/api/v2/agents?limit=20&filter.name=internal&sort=name.asc",
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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
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

  await userEvent.click(
    within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" },
    ),
  );

  await userEvent.click(
    screen.getByRole("option", { name: words("agent.tests.status") }),
  );

  const input = screen.getByPlaceholderText(
    words("agents.filters.status.placeholder"),
  );

  await userEvent.click(input);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  const option = await screen.findByRole("option", {
    name: words("agent.tests.up"),
  });

  await userEvent.click(option);

  expect(apiHelper.pendingRequests[0].url).toEqual(
    "/api/v2/agents?limit=20&filter.status=up&sort=name.asc",
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

  await userEvent.type(input, "aws{enter}");

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  const pauseAgentButton = await within(rows[0]).findByRole("button", {
    name: words("agents.actions.pause"),
  });

  await userEvent.click(pauseAgentButton);

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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
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

  await userEvent.type(input, "bru{enter}");

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "Agents Table Row",
  });
  const unpauseAgentButton = await within(rows[1]).findByRole("button", {
    name: words("agents.actions.unpause"),
  });

  await userEvent.click(unpauseAgentButton);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
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
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await userEvent.click(pauseAgentButton);

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

  const onResumeToggle = await screen.findByRole("switch", {
    name: "aws-on-resume-toggle",
  });

  expect(onResumeToggle).toBeVisible();
  expect(onResumeToggle).toBeChecked();

  await userEvent.click(onResumeToggle);

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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given the Agents view with the environment halted, When setting unpause_on_resume on an agent, Then the correct request is fired", async () => {
  const { component, apiHelper, store } = setup();

  store.dispatch.environment.setEnvironmentDetailsById({
    id: "env",
    value: RemoteData.success({ ...EnvironmentDetails.halted, id: "env" }),
  });
  render(component);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  const onResumeToggle = await screen.findByRole("switch", {
    name: "ecx-on-resume-toggle",
  });

  expect(onResumeToggle).toBeVisible();
  expect(onResumeToggle).not.toBeChecked();

  await userEvent.click(onResumeToggle);

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

test("Given the Agents view with the environment NOT halted, THEN the on resume column shouldn't be shown", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  const tableHeaders = await screen.findAllByRole("columnheader");

  expect(tableHeaders).toHaveLength(2);

  const onResumeColumnHeader = tableHeaders.find(
    (header) => header.textContent === "On resume",
  );

  expect(onResumeColumnHeader).toBeUndefined();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given the Agents view with the environment halted, THEN the on resume column should be shown", async () => {
  const { component, apiHelper, store } = setup();

  store.dispatch.environment.setEnvironmentDetailsById({
    id: "env",
    value: RemoteData.success({ ...EnvironmentDetails.halted, id: "env" }),
  });
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(AgentsMock.response));
  });

  const tableHeaders = await screen.findAllByRole("columnheader");

  expect(tableHeaders).toHaveLength(3);

  const onResumeColumnHeader = tableHeaders.find(
    (header) => header.textContent === "On resume",
  );

  expect(onResumeColumnHeader).toBeDefined();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN AgentsView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
  const { component, apiHelper } = setup();

  render(component);

  //mock that response has more than one site
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...AgentsMock.response,
        metadata: {
          total: 103,
          before: 0,
          after: 3,
          page_size: 100,
        },
        links: {
          self: "",
          next: "/fake-link?end=fake-first-param",
        },
      }),
    );
  });

  expect(screen.getByLabelText("Go to next page")).toBeEnabled();

  await userEvent.click(screen.getByLabelText("Go to next page"));

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&sort=name.asc)/);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...AgentsMock.response,
        metadata: {
          total: 23,
          before: 0,
          after: 3,
          page_size: 20,
        },
        links: {
          self: "",
          next: "/fake-link?end=fake-first-param",
        },
      }),
    );
  });

  //sort on the second page
  await userEvent.click(screen.getByRole("button", { name: "Name" }));

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
  // we are asserting on the second request as the first request is for the updated sorting event, and second is chained to back to the first page with still correct sorting
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(/(&sort=name.desc)/);
});
