import React from "react";
import { useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { createMockResourceSummary } from "@/Test/Data/Resource";
import { SearchHelper } from "@/UI/Routing/SearchHelper";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { words } from "@/UI/words";
import { ResourcesCard } from "./ResourcesCard";

const server = setupServer();
const queryLink = graphql.link("/api/v2/graphql");
const searchHelper = new SearchHelper();

// graphql-request's request() unwraps one "data" envelope, and useGetResources's `select`
// destructures a further `data.data` - so the mocked body needs a second, outer "data" wrapper
// to end up matching ResourcesGraphQLResponse once request() strips its own layer (same
// double-wrap convention as Resource/UI/ResourcesPage/Page.test.tsx's toGqlResponse usage).
function toGqlResponse(resourceSummary: ReturnType<typeof createMockResourceSummary>) {
  return {
    data: {
      resources: {
        totalCount: resourceSummary.totalCount,
        pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: "", startCursor: "" },
        edges: [],
      },
      resourceSummary,
    },
  };
}

function respondWith(resourceSummary: ReturnType<typeof createMockResourceSummary>) {
  server.use(
    queryLink.query("GetResources", () =>
      HttpResponse.json({ data: toGqlResponse(resourceSummary) })
    )
  );
}

function LocationDisplay() {
  const location = useLocation();

  return <div data-testid="location">{JSON.stringify(searchHelper.parse(location.search))}</div>;
}

// Each stat tile is tagged with its (unique) tone as a data-testid - the label text alone isn't
// a safe query target, since a bar's legend row (e.g. "Failed 1") also normalizes its own direct
// text node to exactly "Failed", colliding with the "Failed" stat tile's label. Asserting both
// the label and the value from within the tagged tile means a mixed-up tone/label/value mapping
// actually fails here, not just "some tile somewhere shows this number".
function expectStatTile(
  tone: "brand" | "success" | "danger" | "warning",
  label: string,
  value: string
): void {
  const tile = within(screen.getByTestId(`stat-tile-${tone}`));

  expect(tile.getByText(label)).toBeVisible();
  expect(tile.getByRole("heading", { level: 2 })).toHaveTextContent(value);
}

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={queryClient}>
      <TestMemoryRouter initialEntries={["/?env=aaa"]}>
        <MockedDependencyProvider>
          <LocationDisplay />
          <ResourcesCard />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
}

describe("ResourcesCard", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("shows the title, per-status legend counts and the 4-tile summary", async () => {
    respondWith(createMockResourceSummary());

    render(setup());

    expect(screen.getByText(words("dashboard.resourceManager.title"))).toBeVisible();
    expect(screen.getByText(words("dashboard.resourceManager.subtitle"))).toBeVisible();

    // compliance: compliant 3, has_update 1, non_compliant 1, undefined 1 - wait for the
    // resourceSummary fetch to resolve before asserting on data-dependent content.
    expect(await screen.findByText("3")).toBeVisible();

    // Each tile's value is checked against its own tone+label - isDeploying.true 1,
    // lastHandlerRun.successful 2, lastHandlerRun.failed 1, compliance.non_compliant 1 -
    // instead of just asserting some "1" exists somewhere, which wouldn't catch a tile showing
    // the wrong count.
    expectStatTile("brand", words("dashboard.resourceManager.deployingNow"), "1");
    expectStatTile("success", words("dashboard.resourceManager.deployedOk"), "2");
    expectStatTile("danger", words("dashboard.resourceManager.failed"), "1");
    expectStatTile("warning", words("dashboard.resourceManager.nonCompliant"), "1");

    expect(screen.getByText(words("dashboard.resourceManager.summaryCount")(106))).toBeVisible();
  });

  it("shows a single empty placeholder segment per bar when totalCount is 0", async () => {
    respondWith(createMockResourceSummary({ totalCount: 0 }));

    render(setup());

    expect(await screen.findAllByLabelText("LegendItem-empty")).toHaveLength(3);
    // the legend row (color dot + count per status) is suppressed too, not just the bar itself
    expect(screen.queryByText("Compliant")).not.toBeInTheDocument();
  });

  it("navigates to the Resources page pre-filtered by status, keeping the default !orphaned filter, when a bar segment is clicked", async () => {
    respondWith(createMockResourceSummary());

    render(setup());

    const failedSegment = await screen.findByLabelText("LegendItem-failed");

    await userEvent.click(failedSegment);

    expect(JSON.parse(screen.getByTestId("location").textContent ?? "{}")).toEqual({
      env: "aaa",
      state: { Resources: { filter: { status: ["failed", "!orphaned"] } } },
    });
  });

  // "failed" above exercises the Deploy result bar; this exercises a different bar (Blocked) to
  // confirm the click-to-navigate wiring isn't specific to one ResourceStatusBar instance.
  it("navigates with the clicked status for a different bar (Blocked) too", async () => {
    respondWith(createMockResourceSummary());

    render(setup());

    const blockedSegment = await screen.findByLabelText("LegendItem-blocked");

    await userEvent.click(blockedSegment);

    expect(JSON.parse(screen.getByTestId("location").textContent ?? "{}")).toEqual({
      env: "aaa",
      state: { Resources: { filter: { status: ["blocked", "!orphaned"] } } },
    });
  });

  it("colors the title icon warning when resources have failed handler runs", async () => {
    respondWith(createMockResourceSummary());

    render(setup());

    // The icon renders on first paint with its pre-fetch fallback tone (success), so the
    // assertion has to wait for the query to resolve and the tone to update, rather than just
    // for the element to exist (findByTestId would resolve on the very first, pre-data render).
    await waitFor(() =>
      expect(screen.getByTestId("resource-manager-title-icon")).toHaveAttribute(
        "data-tone",
        "warning"
      )
    );
  });

  it("colors the title icon success when no resources have failed handler runs", async () => {
    respondWith(
      createMockResourceSummary({
        lastHandlerRun: { successful: 3, new: 0, failed: 0, skipped: 0 },
      })
    );

    render(setup());

    // The pre-fetch fallback tone is *also* success, so a bare wait on the tone would pass even
    // if the query never resolved. Gate on the resolved tile value first to prove the fixture was
    // actually read, then assert the tone.
    await within(screen.getByTestId("stat-tile-success")).findByText("3");

    expect(screen.getByTestId("resource-manager-title-icon")).toHaveAttribute(
      "data-tone",
      "success"
    );
  });
});
