import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ServerStatus as ServerStatusType } from "@/Core/Domain";
import { MockedDependencyProvider, ServerStatus } from "@/Test";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { CustomDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { OrchestratorDetailCard } from "./OrchestratorDetailCard";

const datePresenter = new CustomDatePresenter();

const server = setupServer();

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TestMemoryRouter initialEntries={["/?env=aaa"]}>
        <MockedDependencyProvider>
          <OrchestratorDetailCard />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
}

function respondWith(data: ServerStatusType) {
  server.use(http.get("/api/v1/serverstatus", () => HttpResponse.json({ data })));
}

// ServerStatus.withLsm's license.license slice carries hardcoded 2020/2021 expiry dates - always
// in the past, regardless of when the suite runs - so it doubles as a fixed "license expired"
// fixture. This swaps in a far-future date for the "everything healthy" cases.
const withValidLicense: ServerStatusType = {
  ...ServerStatus.withLsm,
  slices: ServerStatus.withLsm.slices.map((slice) =>
    slice.name === "license.license"
      ? { ...slice, status: { ...slice.status, entitlement_valid_until: "2099-01-01T00:00:00" } }
      : slice
  ),
};

const withDatabaseDown: ServerStatusType = {
  ...withValidLicense,
  slices: withValidLicense.slices.map((slice) =>
    slice.name === "core.database"
      ? { ...slice, status: { ...slice.status, connected: false } }
      : slice
  ),
};

describe("OrchestratorDetailCard", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("shows the title, product details and extensions, with a link to the full Status page", async () => {
    respondWith(withValidLicense);

    render(setup());

    expect(screen.getByText(words("dashboard.orchestrator.title"))).toBeVisible();
    expect(await screen.findByText(withValidLicense.product)).toBeVisible();
    expect(screen.getByText(withValidLicense.edition)).toBeVisible();
    expect(screen.getByText(withValidLicense.version)).toBeVisible();
    expect(screen.getByText(withValidLicense.python_version)).toBeVisible();
    expect(screen.getByText(withValidLicense.postgresql_version)).toBeVisible();
    expect(screen.getByText("lsm")).toBeVisible();

    const link = screen.getByRole("link", {
      name: `${words("dashboard.orchestrator.viewFullStatus")} >`,
    });

    expect(link).toHaveAttribute("href", "/status?env=aaa");
  });

  it("shows an Operational badge and a checkmark when the license is valid and server/database/scheduler are all ok", async () => {
    respondWith(withValidLicense);

    render(setup());

    expect(await screen.findByText(words("dashboard.environmentHealth.operational"))).toBeVisible();
    expect(
      screen.queryByText(words("dashboard.environmentHealth.status.attention"))
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(words("dashboard.environmentHealth.status.danger"))
    ).not.toBeInTheDocument();
  });

  it("shows an Attention badge and a warning triangle when the license has expired but server/database/scheduler are ok", async () => {
    // ServerStatus.withLsm's license dates are hardcoded in the past (see fixture comment
    // above); its server/database/scheduler slices are all reported OK.
    respondWith(ServerStatus.withLsm);

    render(setup());

    const entitlementValidUntil = ServerStatus.withLsm.slices.find(
      (slice) => slice.name === "license.license"
    )?.status.entitlement_valid_until as string;
    const expiryDate = datePresenter.format(entitlementValidUntil, "YYYY-MM-DD");

    expect(await screen.findByText(`Expired · exp ${expiryDate}`)).toBeVisible();
    expect(screen.getByText(words("dashboard.environmentHealth.status.attention"))).toBeVisible();
    expect(
      screen.queryByText(words("dashboard.environmentHealth.operational"))
    ).not.toBeInTheDocument();
  });

  it("shows a Danger badge and an error icon when the database is not connected, even with a valid license", async () => {
    respondWith(withDatabaseDown);

    render(setup());

    expect(
      await screen.findByText(words("dashboard.environmentHealth.status.danger"))
    ).toBeVisible();
    expect(
      screen.queryByText(words("dashboard.environmentHealth.operational"))
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(words("dashboard.environmentHealth.status.attention"))
    ).not.toBeInTheDocument();
  });
});
