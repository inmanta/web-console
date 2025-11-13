import { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { delay, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { EnvironmentDetails, MockedDependencyProvider, Resource } from "@/Test";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ResourceDetails } from "@S/ResourceDetails/Data/Mock";
import { Page } from "./Page";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    // In this case, the tooltips are part of the higher hierarchy
    region: { enabled: false },
  },
});

function setup(entries?: string[], halted: boolean = false) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const component = (
    <QueryClientProvider client={client}>
      <TestMemoryRouter initialEntries={entries}>
        <MockedDependencyProvider env={{ ...EnvironmentDetails.env, halted }}>
          <Page />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
  };
}

async function openFiltersDrawer() {
  const filtersButton = await screen.findByRole("button", { name: /Filters/ });

  if (filtersButton.getAttribute("aria-pressed") !== "true") {
    await userEvent.click(filtersButton);
  }
}

async function openStatusFiltersTab() {
  await openFiltersDrawer();

  const statusTab = await screen.findByRole("tab", {
    name: words("resources.filters.tabs.status"),
  });

  await userEvent.click(statusTab);
}

describe("ResourcesPage", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("shows empty table", async () => {
    server.use(
      http.get("/api/v2/resource", () => {
        return HttpResponse.json({
          data: [],
          metadata: {
            total: 0,
            before: 0,
            after: 0,
            page_size: 10,
            deploy_summary: { total: 0, by_state: {} },
          },
          links: { self: "" },
        });
      })
    );

    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "ResourcesPage-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("generic", { name: "ResourcesPage-Empty" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ResourcesPage shows failed table", async () => {
    server.use(
      http.get("/api/v2/resource", () => {
        return HttpResponse.json({ message: "error" }, { status: 500 });
      })
    );

    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "ResourcesPage-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("region", { name: "ResourcesPage-Error" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ResourcesPage shows success table", async () => {
    server.use(
      http.get("/api/v2/resource", () => {
        return HttpResponse.json(Resource.response);
      })
    );

    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "ResourcesPage-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("grid", { name: "ResourcesPage-Success" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ResourcesPage WHEN user clicks on requires toggle THEN list of requires is shown", async () => {
    server.use(
      http.get("/api/v2/resource", () => {
        return HttpResponse.json({
          ...Resource.response,
          data: [
            {
              ...Resource.response.data[0],
              resource_id: ["abc"],
            },
          ],
        });
      }),
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json(ResourceDetails.response);
      })
    );

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });

    const toggleCell = within(rows[0]).getByRole("cell", {
      name: "Toggle-abc",
    });

    const toggleButton = within(toggleCell).getByRole("button");

    await userEvent.click(toggleButton);

    expect(await screen.findByRole("grid", { name: "ResourceRequires-Success" })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ResourcesPage shows next page of resources", async () => {
    server.use(
      http.get("/api/v2/resource", ({ request }) => {
        if (request.url.includes("end=fake-first-param")) {
          return HttpResponse.json(Resource.response);
        }

        return HttpResponse.json({
          data: Resource.response.data.slice(0, 3),
          links: {
            ...Resource.response.links,
            next: "/fake-link?end=fake-first-param",
          },
          metadata: Resource.response.metadata,
        });
      })
    );

    const { component } = setup();

    render(component);
    expect(await screen.findAllByLabelText("Resource Table Row")).toHaveLength(3);

    const button = screen.getAllByRole("button", {
      name: "Go to next page",
    })[0];

    expect(button).toBeEnabled();

    await userEvent.click(button);

    expect(await screen.findAllByLabelText("Resource Table Row")).toHaveLength(6);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ResourcesPage shows sorting buttons for sortable columns", async () => {
    server.use(
      http.get("/api/v2/resource", () => {
        return HttpResponse.json(Resource.response);
      })
    );
    const { component } = setup();

    render(component);

    const table = await screen.findByRole("grid", {
      name: "ResourcesPage-Success",
    });

    expect(table).toBeVisible();
    expect(within(table).getByRole("button", { name: "Type" })).toBeVisible();
    expect(within(table).getByRole("button", { name: "Agent" })).toBeVisible();
    expect(within(table).getByRole("button", { name: "Value" })).toBeVisible();
    expect(
      within(table).getByRole("button", {
        name: words("resources.column.deployState"),
      })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ResourcesPage sets sorting parameters correctly on click", async () => {
    server.use(
      http.get("/api/v2/resource", ({ request }) => {
        if (request.url.includes("sort=agent.asc")) {
          return HttpResponse.json({
            ...Resource.response,
            data: Resource.response.data.reverse(),
          });
        }

        return HttpResponse.json(Resource.response);
      })
    );

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByLabelText("Resource Table Row");

    expect(rows[0]).toHaveTextContent("/tmp/file4");
    expect(rows[5]).toHaveTextContent("std::Directoryagent2/tmp/dir5skippedShow Details");

    const stateButton = await screen.findByRole("button", { name: "Agent" });

    expect(stateButton).toBeVisible();

    await userEvent.click(stateButton);

    const updatedRows = await screen.findAllByLabelText("Resource Table Row");

    expect(updatedRows[0]).toHaveTextContent("std::Directoryagent2/tmp/dir5skippedShow Details");
    expect(updatedRows[5]).toHaveTextContent("/tmp/file4");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ResourcesPage WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/api/v2/resource", ({ request }) => {
        if (request.url.includes("end=fake-first-param")) {
          return HttpResponse.json(Resource.response);
        }

        return HttpResponse.json({
          data: Resource.response.data.slice(0, 3),
          links: {
            ...Resource.response.links,
            next: "/fake-link?end=fake-first-param",
          },
          metadata: Resource.response.metadata,
        });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findAllByLabelText("Resource Table Row")).toHaveLength(3);

    const nextPageButton = screen.getAllByLabelText("Go to next page")[0];

    expect(nextPageButton).toBeEnabled();

    await userEvent.click(nextPageButton);

    expect(await screen.findAllByLabelText("Resource Table Row")).toHaveLength(6);

    //sort on the second page
    await userEvent.click(
      screen.getByRole("button", {
        name: "Type",
      })
    );

    expect(await screen.findAllByLabelText("Resource Table Row")).toHaveLength(3);
  });

  it.each`
    filterType  | filterValue | placeholderText                                 | filterUrlName
    ${"search"} | ${"agent2"} | ${words("resources.filters.resource.agent.placeholder")} | ${"agent"}
    ${"search"} | ${"File"}   | ${words("resources.filters.resource.type.placeholder")}  | ${"resource_type"}
    ${"search"} | ${"tmp"}    | ${words("resources.filters.resource.value.placeholder")} | ${"resource_id_value"}
  `(
    "When using the $filterName filter of type $filterType with value $filterValue and text $placeholderText then the resources with that $filterUrlName should be fetched and shown",
    async ({ filterType, filterValue, placeholderText, filterUrlName }) => {
      server.use(
        http.get("/api/v2/resource", ({ request }) => {
          if (request.url.includes(`filter.${filterUrlName}=${filterValue}`)) {
            return HttpResponse.json({
              data: Resource.response.data.slice(0, 3),
              links: Resource.response.links,
              metadata: Resource.response.metadata,
            });
          }

          return HttpResponse.json(Resource.response);
        })
      );
      const { component } = setup();

      render(component);

      const initialRows = await screen.findAllByRole("row", {
        name: "Resource Table Row",
      });

      expect(initialRows).toHaveLength(6);

      await openFiltersDrawer();

      const input = await screen.findByPlaceholderText(placeholderText);

      await userEvent.click(input);

      if (filterType === "select") {
        const option = await screen.findByRole("option", { name: filterValue });

        await userEvent.click(option);
      } else {
        await userEvent.type(input, `${filterValue}{enter}`);
      }

      const updatedRows = await screen.findAllByRole("row", {
        name: "Resource Table Row",
      });

      expect(updatedRows).toHaveLength(3);

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    }
  );

  it.each`
    filterValueOne | placeholderTextOne                              | filterUrlNameOne       | filterValueTwo | placeholderTextTwo                              | filterUrlNameTwo
    ${"agent2"}    | ${words("resources.filters.resource.agent.placeholder")}  | ${"agent"}             | ${"file3"}     | ${words("resources.filters.resource.value.placeholder")} | ${"resource_id_value"}
    ${"Directory"} | ${words("resources.filters.resource.type.placeholder")}   | ${"resource_type"}     | ${"agent2"}    | ${words("resources.filters.resource.agent.placeholder")} | ${"agent"}
    ${"tmp"}       | ${words("resources.filters.resource.value.placeholder")}  | ${"resource_id_value"} | ${"File"}      | ${words("resources.filters.resource.type.placeholder")}  | ${"resource_type"}
  `(
    "when using the search filters of type $filterType with value $filterValueOne and text $placeholderTextOne combined with $filterType with value $filterValueTwo and text $placeholderText then the resources with that $filterUrlNameOne and $filterUrlNameTwo should be fetched and shown",
    async ({
      filterValueOne,
      placeholderTextOne,
      filterUrlNameOne,
      filterValueTwo,
      placeholderTextTwo,
      filterUrlNameTwo,
    }) => {
      server.use(
        http.get("/api/v2/resource", ({ request }) => {
          if (
            request.url.includes(`filter.${filterUrlNameOne}=${filterValueOne}`) &&
            request.url.includes(`filter.${filterUrlNameTwo}=${filterValueTwo}`)
          ) {
            return HttpResponse.json({
              data: Resource.response.data.slice(0, 3),
              links: Resource.response.links,
              metadata: Resource.response.metadata,
            });
          }

          return HttpResponse.json(Resource.response);
        })
      );
      const { component } = setup();

      render(component);

      const initialRows = await screen.findAllByRole("row", {
        name: "Resource Table Row",
      });

      expect(initialRows).toHaveLength(6);

      await openFiltersDrawer();

      const inputOne = await screen.findByPlaceholderText(placeholderTextOne);

      await userEvent.type(inputOne, `${filterValueOne}{enter}`);

      const inputTwo = await screen.findByPlaceholderText(placeholderTextTwo);

      await userEvent.type(inputTwo, `${filterValueTwo}{enter}`);

      const updatedRows = await screen.findAllByRole("row", {
        name: "Resource Table Row",
      });

      expect(updatedRows).toHaveLength(3);

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    }
  );

  test("when using the all filters then the resources with that filter values should be fetched and shown", async () => {
    server.use(
      http.get("/api/v2/resource", ({ request }) => {
        if (
          request.url.includes(`filter.${filterUrlNameOne}=${filterValueOne}`) &&
          request.url.includes(`filter.${filterUrlNameTwo}=${filterValueTwo}`) &&
          request.url.includes(`filter.${filterUrlNameThree}=${filterValueThree}`)
        ) {
          return HttpResponse.json({
            data: Resource.response.data.slice(0, 3),
            links: Resource.response.links,
            metadata: Resource.response.metadata,
          });
        }

        return HttpResponse.json(Resource.response);
      })
    );
    const filterValueOne = "agent";
    const filterUrlNameOne = "agent";
    const filterValueTwo = "Directory";
    const filterUrlNameTwo = "resource_type";
    const filterValueThree = "dir5";
    const filterUrlNameThree = "resource_id_value";
    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });

    expect(initialRows).toHaveLength(6);

    await openFiltersDrawer();

    const inputOne = await screen.findByPlaceholderText(
      words("resources.filters.resource.agent.placeholder")
    );

    await userEvent.type(inputOne, `${filterValueOne}{enter}`);

    const inputTwo = await screen.findByPlaceholderText(
      words("resources.filters.resource.type.placeholder")
    );

    await userEvent.type(inputTwo, `${filterValueTwo}{enter}`);

    const inputThree = await screen.findByPlaceholderText(
      words("resources.filters.resource.value.placeholder")
    );

    await userEvent.type(inputThree, `${filterValueThree}{enter}`);

    const updatedRows = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });

    expect(updatedRows).toHaveLength(3);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test.each`
    filterValue      | option
    ${"deployed"}    | ${"include"}
    ${"unavailable"} | ${"exclude"}
  `(
    "When using the Deploy state filter with value $filterValue and option $option then the matching resources should be fetched and shown",
    async ({ filterValue, option }) => {
      server.use(
        http.get("/api/v2/resource", ({ request }) => {
          const filter = option === "include" ? filterValue : `%21${filterValue}`;

          if (request.url.includes(`&filter.status=${filter}`)) {
            return HttpResponse.json({
              data: Resource.response.data.slice(0, 3),
              links: Resource.response.links,
              metadata: Resource.response.metadata,
            });
          }

          return HttpResponse.json(Resource.response);
        })
      );
      const { component } = setup();

      render(component);

      const initialRows = await screen.findAllByRole("row", {
        name: "Resource Table Row",
      });

      expect(initialRows).toHaveLength(6);

      await openStatusFiltersTab();

      const statusToggle = await screen.findByRole("button", {
        name: "status-toggle",
      });

      await userEvent.click(statusToggle);

      const toggle = await screen.findByRole("button", {
        name: `${filterValue}-${option}-toggle`,
      });

      await userEvent.click(toggle);

      const rowsAfter = await screen.findAllByRole("row", {
        name: "Resource Table Row",
      });

      expect(rowsAfter).toHaveLength(3);

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    }
  );

  test("When clicking the clear and reset filters then the state filter is updated correctly", async () => {
    server.use(
      http.get("/api/v2/resource", ({ request }) => {
        if (request.url.includes("filter.status=%21orphaned")) {
          return HttpResponse.json(Resource.response);
        }

        return HttpResponse.json({
          data: Resource.response.data.slice(4),
          links: Resource.response.links,
          metadata: Resource.response.metadata,
        });
      })
    );
    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });

    expect(initialRows).toHaveLength(6);

    await openFiltersDrawer();

    const clearAllButton = await screen.findByRole("button", {
      name: words("resources.filters.active.clearAll"),
    });

    expect(clearAllButton).toBeVisible();

    await userEvent.click(clearAllButton);

    const initialRowsAfterClear = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });

    expect(initialRowsAfterClear).toHaveLength(2);

    await openStatusFiltersTab();

    const statusToggle = await screen.findByRole("button", { name: "status-toggle" });

    await userEvent.click(statusToggle);

    await userEvent.click(
      await screen.findByRole("button", { name: "orphaned-exclude-toggle" })
    );

    const initialRowsAfterReset = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });

    expect(initialRowsAfterReset).toHaveLength(6);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ResourcesPage shows deploy state bar", async () => {
    server.use(
      http.get("/api/v2/resource", () => {
        return HttpResponse.json(Resource.response);
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("grid", { name: "ResourcesPage-Success" })).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", {
        name: words("resources.deploySummary.title"),
      })
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ResourcesPage WHEN data is loading for next page THEN shows toolbar", async () => {
    server.use(
      http.get("/api/v2/resource", ({ request }) => {
        delay(100);
        if (request.url.includes("end=fake-param")) {
          return HttpResponse.json({
            ...Resource.response,
            metadata: {
              ...Resource.response.metadata,
              deploy_summary: {
                ...Resource.response.metadata.deploy_summary,
                by_state: {
                  ...Resource.response.metadata.deploy_summary.by_state,
                  available: 2,
                },
              },
            },
          });
        }

        return HttpResponse.json({
          ...Resource.response,
          links: {
            ...Resource.response.links,
            next: "/fake-link?end=fake-param",
          },
        });
      })
    );
    const { component } = setup(["/resources?pageSize=20"]);

    render(component);

    expect(screen.getByRole("region", { name: "ResourcesPage-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("grid", { name: "ResourcesPage-Success" })).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", {
        name: words("resources.deploySummary.title"),
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("generic", {
        name: "LegendItem-available",
      })
    ).toHaveAttribute("data-value", "1");

    const nextButton = screen.getAllByRole("button", {
      name: "Go to next page",
    })[0];

    expect(nextButton).toBeEnabled();

    await userEvent.click(nextButton);

    expect(
      await screen.findByRole("generic", {
        name: words("resources.deploySummary.title"),
      })
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: words("resources.deploySummary.repair"),
      })
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: words("resources.deploySummary.deploy"),
      })
    ).toBeVisible();
    expect(screen.getByRole("navigation", { name: "top-Pagination" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "bottom-Pagination" })).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", {
        name: "LegendItem-available",
      })
    ).toHaveAttribute("data-value", "2");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ResourcesPage WHEN data is auto-updated THEN shows updated toolbar", async () => {
    let count = 0;

    server.use(
      http.get("/api/v2/resource", () => {
        count++;
        if (count > 1) {
          return HttpResponse.json({
            ...Resource.response,
            metadata: {
              ...Resource.response.metadata,
              deploy_summary: {
                ...Resource.response.metadata.deploy_summary,
                by_state: {
                  ...Resource.response.metadata.deploy_summary.by_state,
                  available: 2,
                },
              },
            },
          });
        }

        return HttpResponse.json({
          ...Resource.response,
          links: { ...Resource.response.links, next: "/fake-link" },
        });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("grid", { name: "ResourcesPage-Success" })).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", {
        name: words("resources.deploySummary.title"),
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("generic", {
        name: "LegendItem-available",
      })
    ).toHaveAttribute("data-value", "1");

    expect(
      screen.getByRole("generic", {
        name: words("resources.deploySummary.title"),
      })
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: words("resources.deploySummary.repair"),
      })
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: words("resources.deploySummary.deploy"),
      })
    ).toBeVisible();
    expect(screen.getByRole("navigation", { name: "top-Pagination" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "bottom-Pagination" })).toBeInTheDocument();

    await act(async () => {
      await delay(5000);
    });

    expect(
      await screen.findByRole("generic", {
        name: "LegendItem-available",
      })
    ).toHaveAttribute("data-value", "2");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ResourcesPage shows deploy state bar with available status without processing_events status", async () => {
    server.use(
      http.get("/api/v2/resource", () => {
        return HttpResponse.json(Resource.response);
      })
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", {
        name: words("resources.deploySummary.title"),
      })
    ).toBeInTheDocument();

    const availableItem = screen.getByRole("generic", {
      name: "LegendItem-available",
    });

    expect(availableItem).toBeVisible();
    expect(availableItem).toHaveAttribute("data-value", "1");
    expect(availableItem).not.toHaveAttribute("data-value", "3");

    expect(screen.queryByTestId("Status-processing_events")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the ResourcesPage When clicking on deploy, then the approriate backend request is fired", async () => {
    let body: unknown = {};

    server.use(
      http.get("/api/v2/resource", () => {
        return HttpResponse.json(Resource.response);
      }),
      http.post("/api/v1/deploy", async ({ request }) => {
        const data = await request.json();
        body = data;
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("grid", { name: "ResourcesPage-Success" })).toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole("button", {
        name: words("resources.deploySummary.deploy"),
      })
    );

    expect(
      await screen.findByRole("button", {
        name: words("resources.deploySummary.deploy"),
      })
    ).toBeDisabled();

    expect(screen.getByTestId("dot-indication")).toBeInTheDocument();

    expect(body).toEqual({
      agent_trigger_method: "push_incremental_deploy",
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the ResourcesPage When clicking on repair, then the appropriate backend request is fired", async () => {
    let body: unknown = {};

    server.use(
      http.get("/api/v2/resource", () => {
        return HttpResponse.json(Resource.response);
      }),
      http.post("/api/v1/deploy", async ({ request }) => {
        const data = await request.json();
        body = data;
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("grid", { name: "ResourcesPage-Success" })).toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole("button", {
        name: words("resources.deploySummary.repair"),
      })
    );

    expect(
      await screen.findByRole("button", {
        name: words("resources.deploySummary.repair"),
      })
    ).toBeDisabled();

    expect(body).toEqual({
      agent_trigger_method: "push_full_deploy",
    });

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the ResourcesPage When environment is halted, then deploy and repair buttons are disabled", async () => {
    server.use(
      http.get("/api/v2/resource", () => {
        return HttpResponse.json(Resource.response);
      })
    );
    const { component } = setup(undefined, true);

    render(component);

    expect(await screen.findByRole("grid", { name: "ResourcesPage-Success" })).toBeInTheDocument();

    expect(
      await screen.findByRole("button", {
        name: words("resources.deploySummary.repair"),
      })
    ).toBeDisabled();
    expect(
      await screen.findByRole("button", {
        name: words("resources.deploySummary.deploy"),
      })
    ).toBeDisabled();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
