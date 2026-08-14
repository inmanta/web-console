import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
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

  it("colors the title icon success when the latest compile succeeded", async () => {
    // index 4 in the fixture: started, completed and success: true - a finished, successful compile.
    respondWith(Mock.response.data.slice(4, 5));

    render(setup());

    // The icon renders on first paint with its pre-fetch fallback tone, so the assertion has to
    // wait for the query to resolve and the tone to update, rather than just for the element to
    // exist (findByTestId would resolve on the very first, pre-data render).
    await waitFor(() =>
      expect(screen.getByTestId("compile-reports-title-icon")).toHaveStyle({
        color:
          "color-mix(in srgb, var(--pf-t--global--icon--color--status--success--default) 70%, white)",
      })
    );
  });

  it("colors the title icon warning when the latest compile did not succeed", async () => {
    // index 0 in the fixture: started but not completed - still in progress, so not a success.
    respondWith(Mock.response.data.slice(0, 1));

    render(setup());

    await waitFor(() =>
      expect(screen.getByTestId("compile-reports-title-icon")).toHaveStyle({
        color:
          "color-mix(in srgb, var(--pf-t--global--icon--color--status--warning--default) 70%, white)",
      })
    );
  });
});
