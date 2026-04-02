import { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { delay, graphql, http, HttpResponse } from "msw";
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

// ---------------------------------------------------------------------------
// GraphQL response helpers
// ---------------------------------------------------------------------------

type ResourceRow = (typeof Resource.response)["data"][number];

interface GqlVariables {
  filter?: {
    environment?: string;
    resourceType?: { eq?: string[] };
    agent?: { eq?: string[] };
    resourceIdValue?: { contains?: string[] };
    isOrphan?: boolean;
  };
  first?: number;
  after?: string;
  orderBy?: Array<{ key: string; order: string }>;
}

function toGqlNode(r: ResourceRow) {
  return {
    resourceId: r.resource_id,
    resourceType: r.id_details.resource_type,
    agent: r.id_details.agent,
    resourceIdValue: r.id_details.resource_id_value,
    requiresLength: r.requires.length,
    state: { lastNonDeployingStatus: r.status },
  };
}

function toGqlResponse(
  data: ResourceRow[],
  total = data.length,
  pageInfo: { hasNextPage: boolean; endCursor: string | null } = {
    hasNextPage: false,
    endCursor: null,
  }
) {
  return {
    resources: {
      totalCount: total,
      pageInfo,
      edges: data.map((r) => ({ node: toGqlNode(r) })),
    },

    //Todo: implement this later
    /* resourceSummary: {
      totalCount: data.length,
      lastHandlerRun: {
        successful: data.length,
        new: 0,
        failed: 0,
        skipped: 0,
      },
      blocked: {
        not_blocked: data.length,
        blocked: 0,
        temporarily_blocked: 0,
      },
      compliance: {
        compliant: data.length,
        has_update: 0,
        non_compliant: 0,
        undefined: 0,
      },
      isDeploying: {
        false: data.length,
        true: 0,
      },
    }, */
  };
}

// Standard full response
const gqlFull = toGqlResponse(Resource.response.data, Number(Resource.response.metadata.total));

// Response with only 3 resources
const gqlFirst3 = toGqlResponse(
  Resource.response.data.slice(0, 3),
  Number(Resource.response.metadata.total)
);

// Response with 2 "available" resources (change index 2 from "processing_events" to "available")
const dataWithTwoAvailable = Resource.response.data.map((r, i) =>
  i === 2 ? { ...r, status: "available" } : r
);
const gqlTwoAvailable = toGqlResponse(
  dataWithTwoAvailable,
  Number(Resource.response.metadata.total)
);

// ---------------------------------------------------------------------------

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
  const queryLink = graphql.link("/api/v2/graphql");

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("shows empty table", async () => {
    // TODO: Waiting on update of Joao to see if we adjust all the test but rather work with
    // the operationNames so it can be what it is now => otherwise adjust all to comment
    /* server.use(
      queryBase.operation(() => {
        return HttpResponse.json<{ data: { data: ReturnType<typeof toGqlResponse> } }>({
          data: {
            data: toGqlResponse([], 0),
          },
        });
      })
    ); */
    server.use(
      queryLink.query("GetResources", () => {
        return HttpResponse.json({ data: toGqlResponse([], 0) });
      })
    );

    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "ResourcesPage-Loading" })).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", { name: "ResourcesPage-Empty" }, { timeout: 5000 })
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ResourcesPage shows failed table", async () => {
    server.use(
      http.post("/api/v2/graphql", () => {
        return new HttpResponse(null, { status: 500 });
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
      queryLink.query("GetResources", () => {
        return HttpResponse.json({ data: gqlFull });
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
      queryLink.query("GetResources", () => {
        return HttpResponse.json({
          data: toGqlResponse(
            [
              {
                ...Resource.response.data[0],
                resource_id: "abc",
              },
            ],
            1
          ),
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
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
        if (variables.after === "fake-cursor") {
          return HttpResponse.json({ data: gqlFull });
        }

        return HttpResponse.json({
          data: toGqlResponse(
            Resource.response.data.slice(0, 3),
            Number(Resource.response.metadata.total),
            {
              hasNextPage: true,
              endCursor: "fake-cursor",
            }
          ),
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
      queryLink.query("GetResources", () => {
        return HttpResponse.json({ data: gqlFull });
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
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
        if (variables.orderBy?.[0]?.key === "agent" && variables.orderBy?.[0]?.order === "asc") {
          return HttpResponse.json({
            data: toGqlResponse(
              [...Resource.response.data].reverse(),
              Number(Resource.response.metadata.total)
            ),
          });
        }

        return HttpResponse.json({ data: gqlFull });
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
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
        if (variables.after === "fake-cursor") {
          return HttpResponse.json({ data: gqlFull });
        }

        return HttpResponse.json({
          data: toGqlResponse(
            Resource.response.data.slice(0, 3),
            Number(Resource.response.metadata.total),
            {
              hasNextPage: true,
              endCursor: "fake-cursor",
            }
          ),
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

    //sort on the second page - resets to first page (no after cursor)
    await userEvent.click(
      screen.getByRole("button", {
        name: "Type",
      })
    );

    expect(await screen.findAllByLabelText("Resource Table Row")).toHaveLength(3);
  });

  it.each`
    filterType  | filterValue | placeholderText                                          | filterVariableKey    | filterVariableValue
    ${"search"} | ${"agent2"} | ${words("resources.filters.resource.agent.placeholder")} | ${"agent"}           | ${"agent2"}
    ${"search"} | ${"File"}   | ${words("resources.filters.resource.type.placeholder")}  | ${"resourceType"}    | ${"File"}
    ${"search"} | ${"tmp"}    | ${words("resources.filters.resource.value.placeholder")} | ${"resourceIdValue"} | ${"tmp"}
  `(
    "When using the $filterName filter of type $filterType with value $filterValue and text $placeholderText then the resources with that $filterVariableKey should be fetched and shown",
    async ({
      filterType,
      filterValue,
      placeholderText,
      filterVariableKey,
      filterVariableValue,
    }) => {
      server.use(
        queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
          const filterField = variables.filter?.[
            filterVariableKey as keyof typeof variables.filter
          ] as { eq?: string[]; contains?: string[] } | undefined;
          const values = filterField?.eq ?? filterField?.contains ?? [];

          if (values.includes(filterVariableValue)) {
            return HttpResponse.json({ data: gqlFirst3 });
          }

          return HttpResponse.json({ data: gqlFull });
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
    filterValueOne | placeholderTextOne                                       | filterKeyOne         | filterValueTwo | placeholderTextTwo                                       | filterKeyTwo
    ${"agent2"}    | ${words("resources.filters.resource.agent.placeholder")} | ${"agent"}           | ${"file3"}     | ${words("resources.filters.resource.value.placeholder")} | ${"resourceIdValue"}
    ${"Directory"} | ${words("resources.filters.resource.type.placeholder")}  | ${"resourceType"}    | ${"agent2"}    | ${words("resources.filters.resource.agent.placeholder")} | ${"agent"}
    ${"tmp"}       | ${words("resources.filters.resource.value.placeholder")} | ${"resourceIdValue"} | ${"File"}      | ${words("resources.filters.resource.type.placeholder")}  | ${"resourceType"}
  `(
    "when using the search filters of type $filterType with value $filterValueOne and text $placeholderTextOne combined with $filterType with value $filterValueTwo and text $placeholderText then the resources with that $filterKeyOne and $filterKeyTwo should be fetched and shown",
    async ({
      filterValueOne,
      placeholderTextOne,
      filterKeyOne,
      filterValueTwo,
      placeholderTextTwo,
      filterKeyTwo,
    }) => {
      server.use(
        queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
          const fieldOne = variables.filter?.[filterKeyOne as keyof typeof variables.filter] as
            | { eq?: string[]; contains?: string[] }
            | undefined;
          const valuesOne = fieldOne?.eq ?? fieldOne?.contains ?? [];

          const fieldTwo = variables.filter?.[filterKeyTwo as keyof typeof variables.filter] as
            | { eq?: string[]; contains?: string[] }
            | undefined;
          const valuesTwo = fieldTwo?.eq ?? fieldTwo?.contains ?? [];

          if (valuesOne.includes(filterValueOne) && valuesTwo.includes(filterValueTwo)) {
            return HttpResponse.json({ data: gqlFirst3 });
          }

          return HttpResponse.json({ data: gqlFull });
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
    const filterValueOne = "agent";
    const filterValueTwo = "Directory";
    const filterValueThree = "dir5";

    server.use(
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
        const agentValues = variables.filter?.agent?.eq ?? [];
        const typeValues = variables.filter?.resourceType?.eq ?? [];
        const idValues = variables.filter?.resourceIdValue?.contains ?? [];

        if (
          agentValues.includes(filterValueOne) &&
          typeValues.includes(filterValueTwo) &&
          idValues.includes(filterValueThree)
        ) {
          return HttpResponse.json({ data: gqlFirst3 });
        }

        return HttpResponse.json({ data: gqlFull });
      })
    );
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
      // Note: the GraphQL ResourceFilter does not support filtering by arbitrary status values
      // (only orphaned/!orphaned maps to isOrphan). The mock always returns 3 resources to
      // simulate a filtered response; the filter is applied in UI state regardless.
      server.use(
        queryLink.query("GetResources", () => {
          return HttpResponse.json({ data: gqlFirst3 });
        })
      );
      const { component } = setup();

      render(component);

      const initialRows = await screen.findAllByRole("row", {
        name: "Resource Table Row",
      });

      expect(initialRows).toHaveLength(3);

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
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
        // Default filter: isOrphan: false (excludes orphaned) → return 6 rows
        // No isOrphan filter (clear all) → return 2 rows
        if (variables.filter?.isOrphan === false) {
          return HttpResponse.json({ data: gqlFull });
        }

        return HttpResponse.json({ data: toGqlResponse(Resource.response.data.slice(4), 2) });
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

    await userEvent.click(await screen.findByRole("button", { name: "orphaned-exclude-toggle" }));

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
      queryLink.query("GetResources", () => {
        return HttpResponse.json({ data: gqlFull });
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
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
        delay(100);

        if (variables.after === "fake-param") {
          return HttpResponse.json({ data: gqlTwoAvailable });
        }

        return HttpResponse.json({
          data: toGqlResponse(Resource.response.data, Number(Resource.response.metadata.total), {
            hasNextPage: true,
            endCursor: "fake-param",
          }),
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
      queryLink.query("GetResources", () => {
        count++;
        if (count > 1) {
          return HttpResponse.json({ data: gqlTwoAvailable });
        }

        return HttpResponse.json({
          data: toGqlResponse(Resource.response.data, Number(Resource.response.metadata.total), {
            hasNextPage: true,
            endCursor: "fake-cursor",
          }),
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
      queryLink.query("GetResources", () => {
        return HttpResponse.json({ data: gqlFull });
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
      queryLink.query("GetResources", () => {
        return HttpResponse.json({ data: gqlFull });
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
      queryLink.query("GetResources", () => {
        return HttpResponse.json({ data: gqlFull });
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
      queryLink.query("GetResources", () => {
        return HttpResponse.json({ data: gqlFull });
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
