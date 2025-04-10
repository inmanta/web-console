import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { StaticScheduler, DeferredApiHelper, dependencies } from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import * as DesiredStateVersions from "@S/DesiredState/Data/Mock";
import { Page } from "./Page";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();

  const component = (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        <MemoryRouter>
          <DependencyProvider dependencies={dependencies}>
            <StoreProvider store={store}>
              <Page />
            </StoreProvider>
          </DependencyProvider>
        </MemoryRouter>
      </ModalProvider>
    </QueryClientProvider>
  );

  return { component, apiHelper, scheduler };
}

describe("DesiredStatesView", () => {
  let GETRequestsFired = 0;
  let POSTRequestsFired = 0;
  let DELETERequestsFired = 0;

  const server = setupServer();

  server.events.on("request:start", async ({ request }) => {
    switch (request.method) {
      case "GET":
        GETRequestsFired++;
        break;
      case "POST":
        POSTRequestsFired++;
        break;
      case "DELETE":
        DELETERequestsFired++;
        break;
      default:
        break;
    }
  });

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    GETRequestsFired = 0;
    POSTRequestsFired = 0;
    DELETERequestsFired = 0;
  });

  afterAll(() => {
    server.close();
  });

  it("DesiredStatesView shows empty table", async () => {
    server.use(
      http.get("/api/v2/desiredstate", async () => {
        return HttpResponse.json({
          data: [],
          links: { self: "" },
          metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
        });
      })
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "DesiredStatesView-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", { name: "DesiredStatesView-Empty" })
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("DesiredStatesView shows failed table", async () => {
    server.use(
      http.get("/api/v2/desiredstate", async () => {
        return HttpResponse.json({ message: "Not Found" }, { status: 404 });
      })
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "DesiredStatesView-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "DesiredStatesView-Failed" })
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("AgentsView shows success table", async () => {
    server.use(
      http.get("/api/v2/desiredstate", async () => {
        return HttpResponse.json(DesiredStateVersions.response);
      })
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "DesiredStatesView-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("grid", { name: "DesiredStatesView-Success" })
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("When using the status filter then only the matching desired states should be fetched and shown", async () => {
    server.use(
      http.get("/api/v2/desiredstate", async ({ request }) => {
        //we are expecting that at some point the request will have the filters applied for status and we mock the adequate response
        if (
          request.url.split("?")[1] ===
          "limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired&filter.status=skipped_candidate"
        ) {
          return HttpResponse.json({
            ...DesiredStateVersions.response,
            data: DesiredStateVersions.response.data.slice(0, 3),
          });
        } else {
          return HttpResponse.json(DesiredStateVersions.response);
        }
      })
    );

    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(initialRows).toHaveLength(9);

    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole("button", {
        name: "FilterPicker",
      })
    );

    await userEvent.click(
      screen.getByRole("option", {
        name: words("desiredState.columns.status"),
      })
    );

    const input = screen.getByRole("combobox", { name: "StatusFilterInput" });

    await userEvent.click(input);

    const statusOptions = screen.getAllByRole("option");

    expect(statusOptions).toHaveLength(4);

    const candidateSkippedOption = await screen.findByRole("option", {
      name: words("desiredState.test.skippedCandidate"),
    });

    await userEvent.click(candidateSkippedOption);

    const rowsAfter = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(rowsAfter).toHaveLength(3);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("When using the Date filter then the desired state versions within the range selected range should be fetched and shown", async () => {
    server.use(
      http.get("/api/v2/desiredstate", async ({ request }) => {
        //we are expecting that at some point the request will have the filters applied for date and we mock the adequate response
        if (
          request.url.split("?")[1] ===
          "limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired&filter.date=ge%3A2021-12-05%2B23%3A00%3A00&filter.date=le%3A2021-12-06%2B23%3A00%3A00"
        ) {
          return HttpResponse.json({
            ...DesiredStateVersions.response,
            data: DesiredStateVersions.response.data.slice(0, 3),
          });
        } else {
          return HttpResponse.json(DesiredStateVersions.response);
        }
      })
    );

    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(initialRows).toHaveLength(9);

    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole("button", {
        name: "FilterPicker",
      })
    );

    await userEvent.click(
      screen.getByRole("option", {
        name: words("desiredState.columns.date"),
      })
    );

    const fromDatePicker = screen.getByLabelText("From Date Picker");

    await userEvent.type(fromDatePicker, "2021-12-06");

    const toDatePicker = screen.getByLabelText("To Date Picker");

    await userEvent.type(toDatePicker, "2021-12-07");

    await userEvent.click(screen.getByLabelText("Apply date filter"));

    const rowsAfter = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(rowsAfter).toHaveLength(3);

    // The chips are hidden in small windows, so resize it
    window = Object.assign(window, { innerWidth: 1200 });
    await act(async () => {
      window.dispatchEvent(new Event("resize"));
    });

    expect(await screen.findByText("from | 2021/12/06 00:00:00", { exact: false })).toBeVisible();
    expect(await screen.findByText("to | 2021/12/07 00:00:00", { exact: false })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("When using the Version filter then the desired state versions within the range selected range should be fetched and shown", async () => {
    server.use(
      http.get("/api/v2/desiredstate", async ({ request }) => {
        //we are expecting that at some point the request will have the filters applied for version and we mock the adequate response
        if (
          request.url.split("?")[1] ===
          "limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired&filter.version=ge%3A3&filter.version=le%3A5"
        ) {
          return HttpResponse.json({
            ...DesiredStateVersions.response,
            data: DesiredStateVersions.response.data.slice(0, 3),
          });
        } else {
          return HttpResponse.json(DesiredStateVersions.response);
        }
      })
    );

    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(initialRows).toHaveLength(9);

    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole("button", {
        name: "FilterPicker",
      })
    );

    await userEvent.click(
      screen.getByRole("option", {
        name: words("desiredState.columns.version"),
      })
    );

    const fromDatePicker = await screen.findByLabelText("Version range from");

    await userEvent.type(fromDatePicker, "3");

    const toDatePicker = await screen.findByLabelText("Version range to");

    await userEvent.type(toDatePicker, "5");

    await userEvent.click(await screen.findByLabelText("Apply Version filter"));

    const rowsAfter = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(rowsAfter).toHaveLength(3);

    // The chips are hidden in small windows, so resize it
    window = Object.assign(window, { innerWidth: 1200 });
    await act(async () => {
      await window.dispatchEvent(new Event("resize"));
    });

    expect(await screen.findByText("from | 3", { exact: false })).toBeVisible();
    expect(await screen.findByText("to | 5", { exact: false })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  it("Given the Desired states view When promoting a version, then the correct request is be fired", async () => {
    server.use(
      http.get("/api/v2/desiredstate", async () => {
        return HttpResponse.json(DesiredStateVersions.response);
      }),
      http.post("/api/v2/desiredstate/9/promote", async () => {
        return HttpResponse.json({ status: 200 });
      })
    );

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(POSTRequestsFired).toBe(0);
    expect(GETRequestsFired).toBe(1);

    await userEvent.click(
      within(rows[8]).getByRole("button", {
        name: "actions-toggle",
      })
    );

    expect(
      within(rows[8]).getByRole("button", {
        name: "actions-toggle",
      })
    ).toHaveAttribute("aria-expanded", "true");

    expect(
      screen.getByRole("menuitem", {
        name: words("desiredState.actions.promote"),
      })
    ).toBeDisabled();

    // close first opened popup, to avoid conflict with the next one.
    await userEvent.click(
      within(rows[8]).getByRole("button", {
        name: "actions-toggle",
      })
    );

    await userEvent.click(
      within(rows[0]).getByRole("button", {
        name: "actions-toggle",
      })
    );

    await userEvent.click(screen.getByRole("menuitem", { name: /promote/i }));

    const rowsAfter = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(rowsAfter).toHaveLength(9);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    expect(POSTRequestsFired).toBe(1);
    expect(GETRequestsFired).toBe(2);
  });

  it("Given the Desired states view with filters When promoting a version, then the correct request is be fired", async () => {
    server.use(
      http.get("/api/v2/desiredstate", async ({ request }) => {
        //we are expecting that at some point the request will have the filters applied for status and we mock the adequate response
        if (
          request.url.split("?")[1] ===
          "limit=20&sort=version.desc&filter.status=active&filter.status=retired"
        ) {
          return HttpResponse.json({
            ...DesiredStateVersions.response,
            data: DesiredStateVersions.response.data.slice(0, 3),
          });
        } else {
          return HttpResponse.json(DesiredStateVersions.response);
        }
      }),
      http.post("/api/v2/desiredstate/9/promote", async () => {
        return HttpResponse.json({ status: 200 });
      })
    );

    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(initialRows).toHaveLength(9);

    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole("button", {
        name: "FilterPicker",
      })
    );

    await userEvent.click(
      screen.getByRole("option", {
        name: words("desiredState.columns.status"),
      })
    );

    const input = screen.getByPlaceholderText(words("desiredState.filters.status.placeholder"));

    await userEvent.click(input);

    const option = await screen.findByRole("option", {
      name: words("desiredState.test.candidate"),
    });

    await userEvent.click(option);

    expect(POSTRequestsFired).toBe(0);
    expect(GETRequestsFired).toBe(2);

    const rows = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    await userEvent.click(
      within(rows[0]).getByRole("button", {
        name: "actions-toggle",
      })
    );

    await userEvent.click(
      screen.getByRole("menuitem", {
        name: words("desiredState.actions.promote"),
      })
    );

    const rowsAfter = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    expect(rowsAfter).toHaveLength(3);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
    expect(POSTRequestsFired).toBe(1);
    expect(GETRequestsFired).toBe(3);
  });

  it("Given the Desired states view When promoting a version results in an error, then the error is shown", async () => {
    server.use(
      http.get("/api/v2/desiredstate", async () => {
        return HttpResponse.json(DesiredStateVersions.response);
      }),
      http.post("/api/v2/desiredstate/9/promote", async () => {
        return HttpResponse.json({ message: "something happened" }, { status: 500 });
      })
    );
    const { component } = setup();

    render(component);

    const rows = await screen.findAllByRole("row", {
      name: "DesiredStates Table Row",
    });

    await userEvent.click(
      within(rows[0]).getByRole("button", {
        name: "actions-toggle",
      })
    );

    await userEvent.click(
      screen.getByRole("menuitem", {
        name: words("desiredState.actions.promote"),
      })
    );

    expect(await screen.findByText("something happened")).toBeVisible();
  });

  it("DesiredStatesView shows CompileWidget", async () => {
    server.use(
      http.get("/api/v2/desiredstate", async () => {
        return HttpResponse.json(DesiredStateVersions.response);
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("button", { name: "RecompileButton" })).toBeVisible();
  });

  describe("DeleteModal ", () => {
    it("Shows form when clicking on modal button", async () => {
      server.use(
        http.get("/api/v2/desiredstate", async () => {
          return HttpResponse.json(DesiredStateVersions.response);
        })
      );
      const { component } = setup();

      render(component);
      const rows = await screen.findAllByRole("row", {
        name: "DesiredStates Table Row",
      });

      await userEvent.click(
        within(rows[0]).getByRole("button", {
          name: "actions-toggle",
        })
      );

      await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

      expect(await screen.findByText(words("inventory.deleteVersion.header")(9))).toBeVisible();
      expect(await screen.findByText("Yes")).toBeVisible();
      expect(await screen.findByText("No")).toBeVisible();

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    });

    it("Closes modal when cancelled(both cancel buttons scenario)", async () => {
      server.use(
        http.get("/api/v2/desiredstate", async () => {
          return HttpResponse.json(DesiredStateVersions.response);
        })
      );

      const { component } = setup();

      render(component);

      const rows = await screen.findAllByRole("row", {
        name: "DesiredStates Table Row",
      });

      //close by "no" button scenario
      await userEvent.click(
        within(rows[0]).getByRole("button", {
          name: "actions-toggle",
        })
      );

      await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

      const noButton = await screen.findByText("No");

      await userEvent.click(noButton);

      expect(screen.queryByText("Yes")).not.toBeInTheDocument();

      //close by close button scenario
      await userEvent.click(
        within(rows[0]).getByRole("button", {
          name: "actions-toggle",
        })
      );

      await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

      const closeButton = await screen.findByLabelText("Close");

      await userEvent.click(closeButton);

      expect(screen.queryByText("Yes")).not.toBeInTheDocument();

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    });

    it("Sends request when submitted then request is executed and modal closed", async () => {
      server.use(
        http.get("/api/v2/desiredstate", async () => {
          return HttpResponse.json(DesiredStateVersions.response);
        }),
        http.delete("/api/v1/version/9", async () => {
          return HttpResponse.json({ status: 204 });
        })
      );

      const { component } = setup();

      render(component);

      const rows = await screen.findAllByRole("row", {
        name: "DesiredStates Table Row",
      });

      expect(rows).toHaveLength(9);

      expect(DELETERequestsFired).toBe(0);
      expect(GETRequestsFired).toBe(1);

      await userEvent.click(
        within(rows[0]).getByRole("button", {
          name: "actions-toggle",
        })
      );

      await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));

      const yesButton = await screen.findByText("Yes");

      await userEvent.click(yesButton);

      expect(screen.queryByText("No")).not.toBeInTheDocument();

      //delete request is fired and it will retrigger the get request,
      expect(DELETERequestsFired).toBe(1);
      expect(GETRequestsFired).toBe(3);
      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    });
  });
});
