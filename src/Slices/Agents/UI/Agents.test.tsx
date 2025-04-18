import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies, EnvironmentDetails } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
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

function setup() {
  const store = getStoreInstance();

  dependencies.environmentModifier.setEnvironment("env");

  const component = (
    <QueryClientProvider client={testClient}>
      <MemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <StoreProvider store={store}>
            <Page />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { component, store };
}

describe("Agents", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test("AgentsView shows empty table", async () => {
    server.use(
      http.get("/api/v2/agents", async () => {
        await delay(200);
        return HttpResponse.json({
          data: [],
          links: { self: "" },
          metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
        });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "AgentsView-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("generic", { name: "AgentsView-Empty" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("AgentsView shows failed table", async () => {
    server.use(
      http.get("/api/v2/agents", async () => {
        return HttpResponse.json({ message: "something went wrong" }, { status: 500 });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("region", { name: "AgentsView-Error" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("AgentsView shows success table", async () => {
    server.use(
      http.get("/api/v2/agents", async () => {
        return HttpResponse.json(AgentsMock.response);
      })
    );

    const { component } = setup();

    render(component);

    expect(await screen.findByRole("grid", { name: "AgentsView-Success" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("When using the name filter then only the matching agents should be fetched and shown", async () => {
    server.use(
      http.get("/api/v2/agents", ({ request }) => {
        if (request.url.includes("&filter.name=internal&sort=name.asc")) {
          return HttpResponse.json({
            ...AgentsMock.response,
            data: AgentsMock.response.data.slice(0, 3),
          });
        }
        return HttpResponse.json(AgentsMock.response);
      })
    );

    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });

    expect(initialRows).toHaveLength(6);

    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole("button", {
        name: "FilterPicker",
      })
    );

    await userEvent.click(screen.getByRole("option", { name: words("attribute.name") }));

    const input = screen.getByPlaceholderText(words("home.filters.env.placeholder"));

    await userEvent.type(input, "internal{enter}");

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
    server.use(
      http.get("/api/v2/agents", ({ request }) => {
        if (request.url.includes("&filter.status=up&sort=name.asc")) {
          return HttpResponse.json({
            ...AgentsMock.response,
            data: AgentsMock.response.data.slice(0, 3),
          });
        }
        return HttpResponse.json(AgentsMock.response);
      })
    );

    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });

    expect(initialRows).toHaveLength(6);

    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole("button", {
        name: "FilterPicker",
      })
    );

    await userEvent.click(screen.getByRole("option", { name: words("agent.tests.status") }));

    const input = screen.getByPlaceholderText(words("agents.filters.status.placeholder"));

    await userEvent.click(input);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    const option = await screen.findByRole("option", {
      name: words("agent.tests.up"),
    });

    await userEvent.click(option);

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });

    expect(rowsAfter).toHaveLength(3);
  });

  test("Given the Agents view with filters, When pausing an agent, then the correct request is fired", async () => {
    const data = JSON.parse(JSON.stringify(AgentsMock.response)); //copy the object to avoid mutation overflow to others places
    server.use(
      http.post("/api/v2/agent/aws/pause", () => {
        data.data[0].status = "paused";
        data.data[0].paused = "true";
        return HttpResponse.json();
      }),
      http.get("/api/v2/agents", () => {
        return HttpResponse.json(data);
      })
    );
    const { component } = setup();

    render(component);

    const input = screen.getByPlaceholderText(words("agents.filters.name.placeholder"));

    await userEvent.type(input, "aws{enter}");

    const rows = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });

    //assert the pause state is set to up
    const upState = await within(rows[0]).findByText("up");
    expect(upState).toBeVisible();

    const pauseAgentButton = await within(rows[0]).findByRole("button", {
      name: words("agents.actions.pause"),
    });

    await userEvent.click(pauseAgentButton);

    const updatedRows = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });

    //assert the pause state is updated to paused
    const pausedState = await within(updatedRows[0]).findByText("paused");
    expect(pausedState).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the Agents view with filters, When unpausing an agent, then the correct request is fired", async () => {
    const data = JSON.parse(JSON.stringify(AgentsMock.response)); //copy the object to avoid mutation overflow to others places
    server.use(
      http.post("/api/v2/agent/bru-23-r321/unpause", () => {
        data.data[1].status = "up";
        data.data[1].paused = false;
        return HttpResponse.json();
      }),
      http.get("/api/v2/agents", () => {
        return HttpResponse.json(data);
      })
    );
    const { component } = setup();

    render(component);

    const input = screen.getByPlaceholderText(words("agents.filters.name.placeholder"));

    await userEvent.type(input, "bru{enter}");

    const rows = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });

    //assert the pause state is set to paused
    const pausedState = await within(rows[1]).findByText("paused");
    expect(pausedState).toBeVisible();

    const unpauseAgentButton = await within(rows[1]).findByRole("button", {
      name: words("agents.actions.unpause"),
    });

    await userEvent.click(unpauseAgentButton);

    const updatedRows = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });

    //assert the pause state is updated to up
    const upState = await within(updatedRows[1]).findByText("up");
    expect(upState).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the Agents view When pausing an agent results in an error, then the error is shown", async () => {
    server.use(
      http.post("/api/v2/agent/aws/pause", () => {
        return HttpResponse.json({ message: "something happened" }, { status: 500 });
      }),
      http.get("/api/v2/agents", () => {
        return HttpResponse.json(AgentsMock.response);
      })
    );
    const { component } = setup();

    render(component);

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

    expect(await screen.findByText("something happened")).toBeVisible();
  });

  test("Given the Agents view with the environment halted, When setting keep_paused_on_resume on an agent, Then the correct request is fired", async () => {
    const data = JSON.parse(JSON.stringify(AgentsMock.response)); //copy the object to avoid mutation overflow to others places
    server.use(
      http.post("/api/v2/agent/aws/keep_paused_on_resume", () => {
        data.data[0].keep_paused_on_resume = true;
        return HttpResponse.json();
      }),
      http.get("/api/v2/agents", () => {
        return HttpResponse.json(data);
      })
    );
    const { component, store } = setup();

    store.dispatch.environment.setEnvironmentDetailsById({
      id: "env",
      value: RemoteData.success({ ...EnvironmentDetails.halted, id: "env" }),
    });
    render(component);

    const onResumeToggle = await screen.findByRole("switch", {
      name: "aws-on-resume-toggle",
    });

    expect(onResumeToggle).toBeVisible();
    expect(onResumeToggle).toBeChecked();

    await userEvent.click(onResumeToggle);

    const updatedRows = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });
    const updatedOnResumeToggle = await within(updatedRows[3]).findByRole("switch", {
      name: "ecx-on-resume-toggle",
    });
    expect(updatedOnResumeToggle).toBeVisible();
    expect(updatedOnResumeToggle).not.toBeChecked();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the Agents view with the environment halted, When setting unpause_on_resume on an agent, Then the correct request is fired", async () => {
    const data = JSON.parse(JSON.stringify(AgentsMock.response)); //copy the object to avoid mutation overflow to others places
    server.use(
      http.post("/api/v2/agent/ecx/unpause_on_resume", () => {
        data.data[3].unpause_on_resume = true;
        return HttpResponse.json();
      }),
      http.get("/api/v2/agents", () => {
        return HttpResponse.json(data);
      })
    );

    const { component, store } = setup();

    store.dispatch.environment.setEnvironmentDetailsById({
      id: "env",
      value: RemoteData.success({ ...EnvironmentDetails.halted, id: "env" }),
    });
    render(component);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    const onResumeToggle = await screen.findByRole("switch", {
      name: "ecx-on-resume-toggle",
    });

    expect(onResumeToggle).toBeVisible();
    expect(onResumeToggle).not.toBeChecked();

    await userEvent.click(onResumeToggle);

    const updatedRows = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });
    const updatedOnResumeToggle = await within(updatedRows[3]).findByRole("switch", {
      name: "ecx-on-resume-toggle",
    });
    expect(updatedOnResumeToggle).toBeVisible();
    expect(updatedOnResumeToggle).toBeChecked();
  });

  test("Given the Agents view with the environment NOT halted, THEN the on resume column shouldn't be shown", async () => {
    server.use(
      http.get("/api/v2/agents", async () => {
        return HttpResponse.json(AgentsMock.response);
      })
    );
    const { component } = setup();

    render(component);

    const tableHeaders = await screen.findAllByRole("columnheader");

    expect(tableHeaders).toHaveLength(2);

    const onResumeColumnHeader = tableHeaders.find((header) => header.textContent === "On resume");

    expect(onResumeColumnHeader).toBeUndefined();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the Agents view with the environment halted, THEN the on resume column should be shown", async () => {
    server.use(
      http.get("/api/v2/agents", async () => {
        return HttpResponse.json(AgentsMock.response);
      })
    );
    const { component, store } = setup();

    store.dispatch.environment.setEnvironmentDetailsById({
      id: "env",
      value: RemoteData.success({ ...EnvironmentDetails.halted, id: "env" }),
    });
    render(component);

    const tableHeaders = await screen.findAllByRole("columnheader");

    expect(tableHeaders).toHaveLength(3);

    const onResumeColumnHeader = tableHeaders.find((header) => header.textContent === "On resume");

    expect(onResumeColumnHeader).toBeDefined();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN AgentsView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/api/v2/agents", async ({ request }) => {
        if (request.url.includes("end=fake-first-param")) {
          return HttpResponse.json({
            ...AgentsMock.response,
            data: AgentsMock.response.data.slice(0, 3),
          });
        }
        return HttpResponse.json({
          ...AgentsMock.response,
          metadata: {
            total: 103,
            before: 0,
            after: 83,
            page_size: 100,
          },
          links: {
            self: "",
            next: "/fake-link?end=fake-first-param",
          },
        });
      })
    );
    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });

    expect(initialRows).toHaveLength(6);

    await userEvent.click(screen.getByLabelText("Go to next page"));

    const updatedRows = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });

    expect(updatedRows).toHaveLength(3);

    //sort on the second page
    await userEvent.click(screen.getByRole("button", { name: "Name" }));

    const updatedRows2 = await screen.findAllByRole("row", {
      name: "Agents Table Row",
    });

    expect(updatedRows2).toHaveLength(6);
  });
});
