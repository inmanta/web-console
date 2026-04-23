import { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { graphql, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { PageInfo } from "@/Data/Queries";
import { response } from "@/Slices/Agents";
import { EnvironmentDetails, MockedDependencyProvider, Resource } from "@/Test";
import { createMockResourceSummary } from "@/Test/Data/Resource";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Page } from "./Page";

const axe = configureAxe({
  rules: {
    region: { enabled: false },
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GqlVariables {
  filter?: {
    environment?: string;
    resourceType?: { contains?: string[] };
    agent?: { contains?: string[] };
    resourceIdValue?: { contains?: string[] };
    isOrphan?: boolean;
  };
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  orderBy?: Array<{ key: string; order: string }>;
}

type ResourceData = (typeof Resource.response)["data"];

// ---------------------------------------------------------------------------
// GraphQL response helpers
// ---------------------------------------------------------------------------

function toGqlResponse(
  data: ResourceData,
  total = data.resources.totalCount,
  pageInfo: PageInfo = data.resources.pageInfo
) {
  return {
    data: {
      resources: {
        totalCount: total,
        pageInfo,
        edges: data?.resources?.edges || [],
      },
      resourceSummary: data?.resourceSummary,
    },
  };
}

const BASE_DATA = Resource.response.data;
const ALL_EDGES = BASE_DATA.resources.edges;
const TOTAL_COUNT = Number(BASE_DATA.resources.totalCount);

/** Full response — all resources, default summary */
const gqlFull = toGqlResponse(BASE_DATA, TOTAL_COUNT);

/** Sliced to first 3 edges, same total count */
const gqlFirst3 = toGqlResponse(
  { ...BASE_DATA, resources: { ...BASE_DATA.resources, edges: ALL_EDGES.slice(0, 3) } },
  TOTAL_COUNT
);

/** Updated summary (compliant goes 3 → 4) used for auto-update / next-page tests */
const gqlUpdatedSummary = toGqlResponse({
  ...BASE_DATA,
  resourceSummary: createMockResourceSummary({
    compliance: { compliant: 4, has_update: 1, non_compliant: 0, undefined: 1 },
    lastHandlerRun: { successful: 3, new: 2, failed: 0, skipped: 1 },
  }),
});

const emptyGql = toGqlResponse({
  resources: {
    totalCount: 0,
    pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: "", startCursor: "" },
    edges: [],
  },
  resourceSummary: createMockResourceSummary(),
});

/** Cursor-paginated first page — 3 edges, next page available */
function gqlFirstPage(endCursor = "fake-cursor") {
  return toGqlResponse(
    { ...BASE_DATA, resources: { ...BASE_DATA.resources, edges: ALL_EDGES.slice(0, 3) } },
    TOTAL_COUNT,
    { hasNextPage: true, endCursor, hasPreviousPage: false, startCursor: "" }
  );
}

const agentsMock = http.get("/api/v2/agents", () => HttpResponse.json(response));

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

function setup(entries?: string[], halted = false) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return {
    client,
    component: (
      <QueryClientProvider client={client}>
        <TestMemoryRouter initialEntries={entries}>
          <MockedDependencyProvider env={{ ...EnvironmentDetails.env, halted }}>
            <Page />
          </MockedDependencyProvider>
        </TestMemoryRouter>
      </QueryClientProvider>
    ),
  };
}

// ---------------------------------------------------------------------------
// Interaction helpers
// ---------------------------------------------------------------------------

async function openFiltersDrawer() {
  const button = await screen.findByRole("button", { name: /Filters/ });

  if (button.getAttribute("aria-pressed") !== "true") {
    await userEvent.click(button);
  }
}

async function openStatusFiltersTab() {
  await openFiltersDrawer();

  const statusTab = await screen.findByRole("tab", {
    name: words("resources.filters.tabs.status"),
  });
  await userEvent.click(statusTab);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ResourcesPage", () => {
  const server = setupServer();
  const queryLink = graphql.link("/api/v2/graphql");

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    server.use(agentsMock);
  });

  // --- Loading states ---

  test("shows loading state then empty table", async () => {
    server.use(queryLink.query("GetResources", () => HttpResponse.json({ data: emptyGql })));

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

  test("shows error view when the request fails", async () => {
    server.use(http.post("/api/v2/graphql", () => new HttpResponse(null, { status: 500 })));

    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "ResourcesPage-Loading" })).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "ResourcesPage-Error" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("shows success table", async () => {
    server.use(queryLink.query("GetResources", () => HttpResponse.json({ data: gqlFull })));

    const { component } = setup();

    render(component);

    expect(await screen.findByRole("grid", { name: "ResourcesPage-Success" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  // --- Pagination ---

  test("shows next page of resources", async () => {
    server.use(
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) =>
        HttpResponse.json({
          data: variables.after === "fake-cursor" ? gqlFull : gqlFirstPage(),
        })
      )
    );

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByLabelText("Resource Table Row");
    expect(rows).toHaveLength(3);

    const nextPageButton = screen.getAllByRole("button", { name: "Go to next page" })[0];
    await userEvent.click(nextPageButton);

    const rowsAfterNextPage = await screen.findAllByLabelText("Resource Table Row");
    expect(rowsAfterNextPage).toHaveLength(6);

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  // --- Sorting ---

  test("shows sorting buttons for sortable columns", async () => {
    server.use(queryLink.query("GetResources", () => HttpResponse.json({ data: gqlFull })));

    const { component } = setup();

    render(component);

    const table = await screen.findByRole("grid", { name: "ResourcesPage-Success" });

    expect(
      within(table).getByRole("button", { name: words("resources.column.type") })
    ).toBeVisible();
    expect(
      within(table).getByRole("button", { name: words("resources.column.agent") })
    ).toBeVisible();
    expect(
      within(table).getByRole("button", { name: words("resources.column.value") })
    ).toBeVisible();
    expect(
      within(table).getByRole("columnheader", { name: words("resources.column.status") })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("sets sorting parameters correctly on click", async () => {
    server.use(
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
        if (variables.orderBy?.[0]?.key === "agent" && variables.orderBy?.[0]?.order === "asc") {
          return HttpResponse.json({
            data: toGqlResponse(
              { ...BASE_DATA, resources: { ...BASE_DATA.resources, ...ALL_EDGES.reverse() } },
              TOTAL_COUNT
            ),
          });
        }

        return HttpResponse.json({ data: gqlFull });
      })
    );

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByLabelText("Resource Table Row");

    expect(rows[0]).toHaveTextContent("std::Fileagent2/tmp/file4Show Details");
    expect(rows[5]).toHaveTextContent("std::Directoryagent2/tmp/dir5Show Details");

    const agentButton = await screen.findByRole("button", { name: "Agent" });
    await userEvent.click(agentButton);

    const updatedRows = await screen.findAllByLabelText("Resource Table Row");

    expect(updatedRows[0]).toHaveTextContent("std::Directoryagent2/tmp/dir5Show Details");
    expect(updatedRows[5]).toHaveTextContent("std::Fileagent2/tmp/file4Show Details");

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("resets to the first page when sorting changes", async () => {
    server.use(
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) =>
        HttpResponse.json({
          data: variables.after === "fake-cursor" ? gqlFull : gqlFirstPage(),
        })
      )
    );

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByLabelText("Resource Table Row");
    expect(rows).toHaveLength(3);

    const nextPageButton = screen.getAllByLabelText("Go to next page")[0];
    await userEvent.click(nextPageButton);

    const rowsAfterNextPage = await screen.findAllByLabelText("Resource Table Row");
    expect(rowsAfterNextPage).toHaveLength(6);

    const typeButton = screen.getByRole("button", { name: "Type" });
    await userEvent.click(typeButton);

    const rowsAfterTypeSorting = await screen.findAllByLabelText("Resource Table Row");
    expect(rowsAfterTypeSorting).toHaveLength(3);
  });

  test("resets to the first page when a filter changes", async () => {
    server.use(
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
        const hasAgent = (variables.filter?.agent?.contains ?? []).includes("agent2");

        if (variables.after === "fake-cursor" && !hasAgent) {
          return HttpResponse.json({ data: gqlFull });
        }

        if (hasAgent) {
          return HttpResponse.json({ data: gqlFirst3 });
        }

        return HttpResponse.json({ data: gqlFirstPage() });
      })
    );

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByLabelText("Resource Table Row");
    expect(rows).toHaveLength(3);

    const nextPageButton = screen.getAllByLabelText("Go to next page")[0];
    await userEvent.click(nextPageButton);

    const rowsAfterNextPage = await screen.findAllByLabelText("Resource Table Row");
    expect(rowsAfterNextPage).toHaveLength(6);

    await openFiltersDrawer();

    const agentInput = await screen.findByPlaceholderText(
      words("resources.filters.resource.agent.placeholder")
    );
    await userEvent.type(agentInput, "agent2{enter}");

    const rowsAfterAgentFilter = await screen.findAllByLabelText("Resource Table Row");
    expect(rowsAfterAgentFilter).toHaveLength(3);
  });

  // --- Filters ---

  it.each`
    filterValue | placeholderText                                          | filterVariableKey    | filterVariableValue
    ${"agent2"} | ${words("resources.filters.resource.agent.placeholder")} | ${"agent"}           | ${"agent2"}
    ${"File"}   | ${words("resources.filters.resource.type.placeholder")}  | ${"resourceType"}    | ${"File"}
    ${"tmp"}    | ${words("resources.filters.resource.value.placeholder")} | ${"resourceIdValue"} | ${"tmp"}
  `(
    "filters by $filterVariableKey=$filterVariableValue",
    async ({ filterValue, placeholderText, filterVariableKey, filterVariableValue }) => {
      server.use(
        queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
          const field = variables.filter?.[filterVariableKey as keyof typeof variables.filter] as
            | { eq?: string[]; contains?: string[] }
            | undefined;
          const values = field?.eq ?? field?.contains ?? [];

          return HttpResponse.json({
            data: values.includes(filterVariableValue) ? gqlFirst3 : gqlFull,
          });
        })
      );

      const { component } = setup();

      render(component);

      const rows = await screen.findAllByLabelText("Resource Table Row");
      expect(rows).toHaveLength(6);

      await openFiltersDrawer();

      const filterInput = await screen.findByPlaceholderText(placeholderText);
      await userEvent.type(filterInput, `${filterValue}{enter}`);

      const rowsAfterFilter = await screen.findAllByLabelText("Resource Table Row");
      expect(rowsAfterFilter).toHaveLength(3);

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
    "filters by $filterKeyOne and $filterKeyTwo combined",
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
          const fieldTwo = variables.filter?.[filterKeyTwo as keyof typeof variables.filter] as
            | { eq?: string[]; contains?: string[] }
            | undefined;

          const hasOne = (fieldOne?.eq ?? fieldOne?.contains ?? []).includes(filterValueOne);
          const hasTwo = (fieldTwo?.eq ?? fieldTwo?.contains ?? []).includes(filterValueTwo);

          return HttpResponse.json({ data: hasOne && hasTwo ? gqlFirst3 : gqlFull });
        })
      );

      const { component } = setup();

      render(component);

      const rows = await screen.findAllByLabelText("Resource Table Row");
      expect(rows).toHaveLength(6);

      await openFiltersDrawer();

      const filterInputOne = await screen.findByPlaceholderText(placeholderTextOne);
      await userEvent.type(filterInputOne, `${filterValueOne}{enter}`);
      const filterInputTwo = await screen.findByPlaceholderText(placeholderTextTwo);
      await userEvent.type(filterInputTwo, `${filterValueTwo}{enter}`);

      const rowsAfterFiltering = await screen.findAllByLabelText("Resource Table Row");
      expect(rowsAfterFiltering).toHaveLength(3);

      await act(async () => {
        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
      });
    }
  );

  test("filters by all three fields combined", async () => {
    const agentValue = "agent2";
    const typeValue = "std::File";
    const idValue = "std::File[agent2,path=/tmp/file4]";

    server.use(
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
        const hasAgent = (variables.filter?.agent?.contains ?? []).includes(agentValue);
        const hasType = (variables.filter?.resourceType?.contains ?? []).includes(typeValue);
        const hasId = (variables.filter?.resourceIdValue?.contains ?? []).includes(idValue);

        return HttpResponse.json({ data: hasAgent && hasType && hasId ? gqlFirst3 : gqlFull });
      })
    );

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByLabelText("Resource Table Row");
    expect(rows).toHaveLength(6);

    await openFiltersDrawer();

    const agentInput = await screen.findByPlaceholderText(
      words("resources.filters.resource.agent.placeholder")
    );
    await userEvent.type(agentInput, `${agentValue}{enter}`);
    const typeInput = await screen.findByPlaceholderText(
      words("resources.filters.resource.type.placeholder")
    );
    await userEvent.type(typeInput, `${typeValue}{enter}`);

    const idInput = await screen.findByPlaceholderText(
      words("resources.filters.resource.value.placeholder")
    );

    await userEvent.click(idInput);
    await userEvent.paste(idValue);
    await userEvent.keyboard("{enter}");

    const rowsAfterFiltering = await screen.findAllByLabelText("Resource Table Row");
    expect(rowsAfterFiltering).toHaveLength(3);

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test.each`
    filterValue      | option
    ${"deployed"}    | ${"include"}
    ${"unavailable"} | ${"exclude"}
  `("status filter: $filterValue / $option", async ({ filterValue, option }) => {
    server.use(queryLink.query("GetResources", () => HttpResponse.json({ data: gqlFirst3 })));

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByLabelText("Resource Table Row");
    expect(rows).toHaveLength(3);

    await openStatusFiltersTab();

    const statusToggle = await screen.findByRole("button", { name: "status-toggle" });
    await userEvent.click(statusToggle);

    const filterToggle = await screen.findByRole("button", {
      name: `${filterValue}-${option}-toggle`,
    });
    await userEvent.click(filterToggle);

    const rowsAfterTogglingStatus = await screen.findAllByLabelText("Resource Table Row");
    expect(rowsAfterTogglingStatus).toHaveLength(3);

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("clear all filters removes default orphan filter", async () => {
    server.use(
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) =>
        HttpResponse.json({
          data:
            variables.filter?.isOrphan === false
              ? gqlFull
              : toGqlResponse(
                  {
                    ...BASE_DATA,
                    resources: { ...BASE_DATA.resources, edges: ALL_EDGES.slice(4) },
                  },
                  2
                ),
        })
      )
    );

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByLabelText("Resource Table Row");
    expect(rows).toHaveLength(6);

    await openFiltersDrawer();

    const clearAllButton = await screen.findByRole("button", {
      name: words("resources.filters.active.clearAll"),
    });
    await userEvent.click(clearAllButton);

    const rowsAfterClearingFilters = await screen.findAllByLabelText("Resource Table Row");
    expect(rowsAfterClearingFilters).toHaveLength(2);

    await openStatusFiltersTab();

    const statusToggle = await screen.findByRole("button", { name: "status-toggle" });
    await userEvent.click(statusToggle);

    const orphanExcludeToggle = await screen.findByRole("button", {
      name: "orphaned-exclude-toggle",
    });
    await userEvent.click(orphanExcludeToggle);

    const rowsAfterExcludingOrphans = await screen.findAllByLabelText("Resource Table Row");
    expect(rowsAfterExcludingOrphans).toHaveLength(6);

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("active filter count badge increments when filters are applied", async () => {
    server.use(queryLink.query("GetResources", () => HttpResponse.json({ data: gqlFull })));

    const { component } = setup();

    render(component);

    await screen.findByRole("grid", { name: "ResourcesPage-Success" });

    await openFiltersDrawer();

    // Default filter (orphaned excluded) counts as 1
    expect(screen.getByRole("button", { name: /Filters/ })).toHaveTextContent("1");

    const agentInput = await screen.findByPlaceholderText(
      words("resources.filters.resource.agent.placeholder")
    );
    await userEvent.type(agentInput, "agent2{enter}");

    expect(screen.getByRole("button", { name: /Filters/ })).toHaveTextContent("2");

    const typeInput = await screen.findByPlaceholderText(
      words("resources.filters.resource.type.placeholder")
    );
    await userEvent.type(typeInput, "std::File{enter}");

    expect(screen.getByRole("button", { name: /Filters/ })).toHaveTextContent("3");
  });

  test("agent filter dropdown shows options fetched from the API", async () => {
    server.use(queryLink.query("GetResources", () => HttpResponse.json({ data: gqlFull })));

    const { component } = setup();

    render(component);

    await screen.findByRole("grid", { name: "ResourcesPage-Success" });

    await openFiltersDrawer();

    const agentInput = await screen.findByPlaceholderText(
      words("resources.filters.resource.agent.placeholder")
    );
    await userEvent.click(agentInput);

    expect(screen.getByRole("option", { name: "aws" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "bru-23-r321" })).toBeInTheDocument();
  });

  // --- Summary bar & toolbar ---

  test("shows deploy summary bar", async () => {
    server.use(queryLink.query("GetResources", () => HttpResponse.json({ data: gqlFull })));

    const { component } = setup();

    render(component);

    await screen.findByRole("grid", { name: "ResourcesPage-Success" });

    const legendBars = await screen.findAllByRole("generic", {
      name: words("resources.deploySummary.title"),
    });
    expect(legendBars.length).toBeGreaterThan(0);

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("shows deploying count label when resources are deploying", async () => {
    server.use(
      queryLink.query("GetResources", () =>
        HttpResponse.json({
          data: toGqlResponse({
            ...BASE_DATA,
            resourceSummary: createMockResourceSummary({ isDeploying: { true: 3, false: 3 } }),
          }),
        })
      )
    );

    const { component } = setup();

    render(component);

    await screen.findByRole("grid", { name: "ResourcesPage-Success" });

    const label = screen.getByTestId("deploying-label");

    expect(label).toHaveTextContent("3");
  });

  test("toolbar stays visible and updates after navigating to next page", async () => {
    server.use(
      queryLink.query("GetResources", ({ variables }: { variables: GqlVariables }) => {
        if (variables.after === "fake-cursor") {
          return HttpResponse.json({ data: gqlUpdatedSummary });
        }

        return HttpResponse.json({
          data: toGqlResponse(BASE_DATA, TOTAL_COUNT, {
            hasNextPage: true,
            endCursor: "fake-cursor",
            hasPreviousPage: false,
            startCursor: "",
          }),
        });
      })
    );

    const { component } = setup(["/resources?pageSize=20"]);

    render(component);

    await screen.findByRole("grid", { name: "ResourcesPage-Success" });

    const compliantLegendItem = screen.getByRole("generic", { name: "LegendItem-compliant" });
    expect(compliantLegendItem).toHaveAttribute("data-value", "3");

    const nextPageButton = screen.getAllByRole("button", { name: "Go to next page" })[0];
    await userEvent.click(nextPageButton);

    const legendBars = await screen.findAllByRole("generic", {
      name: words("resources.deploySummary.title"),
    });
    expect(legendBars[0]).toBeVisible();

    const repairButton = screen.getByRole("button", {
      name: words("resources.deploySummary.repair"),
    });
    expect(repairButton).toBeVisible();

    const deployButton = screen.getByRole("button", {
      name: words("resources.deploySummary.deploy"),
    });
    expect(deployButton).toBeVisible();

    expect(screen.getByRole("navigation", { name: "top-Pagination" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "bottom-Pagination" })).toBeInTheDocument();

    const compliantLegendItemAfterActions = await screen.findByRole("generic", {
      name: "LegendItem-compliant",
    });
    expect(compliantLegendItemAfterActions).toHaveAttribute("data-value", "4");

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("toolbar updates when data is auto-refreshed", async () => {
    let callCount = 0;

    server.use(
      queryLink.query("GetResources", () => {
        callCount++;

        return HttpResponse.json({ data: callCount > 1 ? gqlUpdatedSummary : gqlFull });
      })
    );

    const { component, client } = setup();

    render(component);

    await screen.findByRole("grid", { name: "ResourcesPage-Success" });

    const complianceLegendBar = screen.getByTestId("legend-bar-compliance");
    const compliantLegendItem = within(complianceLegendBar).getByRole("generic", {
      name: "LegendItem-compliant",
    });
    expect(compliantLegendItem).toHaveAttribute("data-value", "3");

    // Refetch the query
    await act(async () => {
      await client.refetchQueries();
    });

    // Wait for the DOM to reflect the updated value
    await waitFor(() => {
      expect(compliantLegendItem).toHaveAttribute("data-value", "4");
    });

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  // --- Deploy / Repair buttons ---

  test("deploy button fires correct request", async () => {
    let body: unknown = {};

    server.use(
      queryLink.query("GetResources", () => HttpResponse.json({ data: gqlFull })),
      http.post("/api/v1/deploy", async ({ request }) => {
        body = await request.json();
      })
    );

    const { component } = setup();

    render(component);

    await screen.findByRole("grid", { name: "ResourcesPage-Success" });

    const deployButton = await screen.findByRole("button", {
      name: words("resources.deploySummary.deploy"),
    });
    await userEvent.click(deployButton);

    expect(deployButton).toBeDisabled();
    expect(screen.getByTestId("dot-indication")).toBeInTheDocument();
    expect(body).toEqual({ agent_trigger_method: "push_incremental_deploy" });

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("repair button fires correct request", async () => {
    let body: unknown = {};

    server.use(
      queryLink.query("GetResources", () => HttpResponse.json({ data: gqlFull })),
      http.post("/api/v1/deploy", async ({ request }) => {
        body = await request.json();
      })
    );

    const { component } = setup();

    render(component);

    await screen.findByRole("grid", { name: "ResourcesPage-Success" });

    const repairButton = await screen.findByRole("button", {
      name: words("resources.deploySummary.repair"),
    });
    await userEvent.click(repairButton);

    expect(repairButton).toBeDisabled();
    expect(body).toEqual({ agent_trigger_method: "push_full_deploy" });

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("deploy and repair buttons are disabled when environment is halted", async () => {
    server.use(queryLink.query("GetResources", () => HttpResponse.json({ data: gqlFull })));

    const { component } = setup(undefined, true);

    render(component);

    await screen.findByRole("grid", { name: "ResourcesPage-Success" });

    const repairButton = screen.getByRole("button", {
      name: words("resources.deploySummary.repair"),
    });
    expect(repairButton).toBeDisabled();

    const deployButton = await screen.findByRole("button", {
      name: words("resources.deploySummary.deploy"),
    });
    expect(deployButton).toBeDisabled();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });
});
