import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { words } from "@/UI/words";
import { mockedMetrics } from "@S/Dashboard/Core/Mock";
import { OrchestrationEngineCard } from "./OrchestrationEngineCard";

const server = setupServer();

// The card fires two /api/v2/compilereport requests (total in range, failed in range) that only
// differ by the `filter.success=false` param the failed-only query adds - branching on that lets
// one handler serve both with distinct totals.
function respondWith(totalCompiles: number, totalFailed: number) {
  server.use(
    http.get("/api/v2/metrics", () => HttpResponse.json({ data: mockedMetrics })),
    http.get("/api/v2/compilereport", ({ request }) => {
      const isFailedQuery = new URL(request.url).search.includes("filter.success=false");

      return HttpResponse.json({
        data: [],
        links: { self: "" },
        metadata: {
          total: isFailedQuery ? totalFailed : totalCompiles,
          before: 0,
          after: 0,
          page_size: 1,
        },
      });
    })
  );
}

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return (
    <QueryClientProvider client={queryClient}>
      <TestMemoryRouter initialEntries={["/?env=aaa"]}>
        <MockedDependencyProvider>
          <OrchestrationEngineCard />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
}

// Each stat tile renders immediately with a "0"/"—" fallback before its query resolves, so the
// value must be awaited rather than asserted on synchronously (unlike the always-present label).
async function expectStat(testId: string, value: string, label: string): Promise<void> {
  const stat = within(screen.getByTestId(`orchestration-engine-stat-${testId}`));

  expect(await stat.findByText(value)).toBeVisible();
  expect(stat.getByText(label)).toBeVisible();
}

describe("OrchestrationEngineCard", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("shows the title, subtitle and the Compiles/Failed/Avg compile/Avg waiting stats", async () => {
    respondWith(142, 3);

    render(setup());

    expect(screen.getByText(words("dashboard.orchestrationEngine.title"))).toBeVisible();
    expect(screen.getByText(words("dashboard.orchestrationEngine.subtitle")(7))).toBeVisible();

    await expectStat("compiles", "142", words("dashboard.orchestrationEngine.stats.compiles"));
    await expectStat("failed", "3", words("dashboard.orchestrationEngine.stats.failed"));
    // Averages are derived from mockedMetrics's orchestrator.compile_time/compile_waiting_time
    // series (mean of all 14 datapoints, kept to 2 decimal places rather than rounded).
    await expectStat(
      "avg-compile",
      "13.22s",
      words("dashboard.orchestrationEngine.stats.avgCompile")
    );
    await expectStat(
      "avg-waiting",
      "5.28s",
      words("dashboard.orchestrationEngine.stats.avgWaiting")
    );
  });

  it("shows a dash for the averages and 0 for the counts before the queries resolve", () => {
    respondWith(142, 3);

    render(setup());

    // Asserted synchronously, right after render and before MSW's (async) responses land, so
    // this exercises the pre-data fallback state rather than the loaded one.
    expect(
      within(screen.getByTestId("orchestration-engine-stat-compiles")).getByText("0")
    ).toBeVisible();
    expect(
      within(screen.getByTestId("orchestration-engine-stat-avg-compile")).getByText("—")
    ).toBeVisible();
    expect(
      within(screen.getByTestId("orchestration-engine-stat-avg-waiting")).getByText("—")
    ).toBeVisible();
  });

  it("defaults to the Compile rate tab, and switches the chart title when another tab is selected", async () => {
    respondWith(142, 3);

    render(setup());

    expect(
      await screen.findByText(words("dashboard.orchestrationEngine.chart.rate.title"))
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", { name: words("dashboard.orchestrationEngine.tabs.time") })
    );

    expect(screen.getByText(words("dashboard.orchestrationEngine.chart.time.title"))).toBeVisible();
    expect(
      screen.queryByText(words("dashboard.orchestrationEngine.chart.rate.title"))
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: words("dashboard.orchestrationEngine.tabs.waiting") })
    );

    expect(
      screen.getByText(words("dashboard.orchestrationEngine.chart.waiting.title"))
    ).toBeVisible();
  });

  it("defaults to a 7-day range, and switches to 14/30 days when picked from the range dropdown", async () => {
    respondWith(142, 3);

    render(setup());

    expect(
      screen.getByRole("button", { name: words("dashboard.orchestrationEngine.range.last7Days") })
    ).toBeVisible();
    expect(screen.getByText(words("dashboard.orchestrationEngine.subtitle")(7))).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", { name: words("dashboard.orchestrationEngine.range.last7Days") })
    );
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: words("dashboard.orchestrationEngine.range.last14Days"),
      })
    );

    expect(
      screen.getByRole("button", {
        name: words("dashboard.orchestrationEngine.range.last14Days"),
      })
    ).toBeVisible();
    expect(screen.getByText(words("dashboard.orchestrationEngine.subtitle")(14))).toBeVisible();
  });

  it("refetches the metrics when the refresh button is clicked", async () => {
    let metricsRequestCount = 0;

    server.use(
      http.get("/api/v2/metrics", () => {
        metricsRequestCount++;

        return HttpResponse.json({ data: mockedMetrics });
      }),
      http.get("/api/v2/compilereport", () =>
        HttpResponse.json({
          data: [],
          links: { self: "" },
          metadata: { total: 0, before: 0, after: 0, page_size: 1 },
        })
      )
    );

    render(setup());

    await screen.findByText(words("dashboard.orchestrationEngine.chart.rate.title"));
    expect(metricsRequestCount).toBe(1);

    await userEvent.click(
      screen.getByRole("button", { name: words("dashboard.orchestrationEngine.refresh") })
    );

    expect(metricsRequestCount).toBe(2);
  });
});
