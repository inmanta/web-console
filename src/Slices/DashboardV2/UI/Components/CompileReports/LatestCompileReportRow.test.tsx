import React from "react";
import { render, screen } from "@testing-library/react";
import { CompileReport } from "@/Slices/CompileReports/Core/Domain";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { words } from "@/UI/words";
import { LatestCompileReportRow } from "./LatestCompileReportRow";

const routeManager = PrimaryRouteManager("");

function makeReport(overrides: Partial<CompileReport> = {}): CompileReport {
  return {
    id: "report-1",
    environment: "env-1",
    requested: "2021-09-09T09:00:00.000000",
    started: "2021-09-09T09:00:20.000000",
    completed: "2021-09-09T09:00:40.000000",
    success: true,
    do_export: true,
    force_update: false,
    metadata: { type: "api", message: "Recompile trigger through API call" },
    environment_variables: {},
    version: 1,
    ...overrides,
  };
}

function renderRow(report: CompileReport) {
  return render(
    <TestMemoryRouter initialEntries={["/?env=aaa"]}>
      <DependencyProvider dependencies={{ routeManager }}>
        <LatestCompileReportRow report={report} />
      </DependencyProvider>
    </TestMemoryRouter>
  );
}

describe("LatestCompileReportRow", () => {
  it("shows the trigger and message, duration and a 'View report' link for a successful compile", () => {
    renderRow(makeReport());

    expect(screen.getByText("api -", { exact: false })).toBeVisible();
    expect(screen.getByText("Recompile trigger through API call")).toBeVisible();
    expect(screen.getByText("20 s")).toBeVisible();

    const link = screen.getByRole("link", {
      name: `${words("dashboardV2.compileReports.viewReport")} >`,
    });

    // The details link is built from the global `location.search`, not the router's own
    // location (see LatestCompileReportRow.tsx), which jsdom defaults to empty in tests.
    expect(link).toHaveAttribute("href", "/compilereports/report-1");
  });

  it("shows a danger 'View report' link for a failed compile", () => {
    renderRow(makeReport({ success: false }));

    expect(
      screen.getByRole("link", { name: `${words("dashboardV2.compileReports.viewReport")} >` })
    ).toBeInTheDocument();
  });

  it("shows 'Running…' and 'started X ago' with a 'View progress' link while in progress", () => {
    renderRow(makeReport({ completed: null }));

    expect(screen.getByText(words("dashboardV2.compileReports.running"))).toBeVisible();
    expect(
      screen.getByText(words("dashboardV2.compileReports.startedAgo"), { exact: false })
    ).toBeVisible();

    const link = screen.getByRole("link", {
      name: `${words("dashboardV2.compileReports.viewProgress")} >`,
    });

    // The details link is built from the global `location.search`, not the router's own
    // location (see LatestCompileReportRow.tsx), which jsdom defaults to empty in tests.
    expect(link).toHaveAttribute("href", "/compilereports/report-1");
  });

  it("shows 'Queued' without a 'started X ago' line for a queued compile", () => {
    renderRow(makeReport({ started: null, completed: null }));

    expect(screen.getByText(words("dashboardV2.compileReports.queued"))).toBeVisible();
    expect(
      screen.queryByText(words("dashboardV2.compileReports.startedAgo"), { exact: false })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: `${words("dashboardV2.compileReports.viewProgress")} >` })
    ).toBeInTheDocument();
  });

  it("omits the trigger prefix when metadata.type is absent (e.g. scheduler-triggered compiles)", () => {
    renderRow(makeReport({ metadata: { message: "Recompile model on schedule" } }));

    expect(screen.getByText("Recompile model on schedule")).toBeVisible();
    expect(screen.queryByText(/ -$/)).not.toBeInTheDocument();
  });
});
