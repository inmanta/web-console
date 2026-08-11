import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { words } from "@/UI/words";
import * as Mock from "@S/CompileReports/Core/Mock";
import { LatestCompileReportsPanel } from "./LatestCompileReportsPanel";

const server = setupServer();

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TestMemoryRouter initialEntries={["/?env=aaa"]}>
        <MockedDependencyProvider>
          <LatestCompileReportsPanel />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
}

function respondWith(data: typeof Mock.response.data) {
  server.use(
    http.get("/api/v2/compilereport", () =>
      HttpResponse.json({
        data,
        links: { self: "" },
        metadata: { total: data.length, before: 0, after: 0, page_size: 5 },
      })
    )
  );
}

describe("LatestCompileReportsPanel", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("shows the title and a link to the full compile reports page", async () => {
    respondWith([]);

    render(setup());

    expect(await screen.findByText(words("dashboard.compileReports.title"))).toBeVisible();

    const link = screen.getByRole("link", { name: words("dashboard.compileReports.viewAll") });

    expect(link).toHaveAttribute("href", "/compilereports?env=aaa");
  });

  it("shows an empty message when there are no compile reports", async () => {
    respondWith([]);

    render(setup());

    expect(await screen.findByText(words("dashboard.compileReports.empty"))).toBeVisible();
  });

  it("renders one row per compile report returned by the query", async () => {
    respondWith(Mock.response.data.slice(0, 3));

    render(setup());

    const rows = await screen.findAllByText("message");

    expect(rows).toHaveLength(3);
    expect(screen.queryByText(words("dashboard.compileReports.empty"))).not.toBeInTheDocument();
  });
});
