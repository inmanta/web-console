import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { graphql } from "msw/graphql";
import { setupServer } from "msw/node";
import { getFeatureRoutes, RouteFactory, words } from "@inmanta/web-console-core";
import { environmentFeature } from "@inmanta/web-console-feature-environment";
import {
  Environment,
  MockedDependencyProvider,
  Project,
  ServerStatus,
  stubRoute,
} from "@inmanta/web-console-test-utils";
import { createMockResourceSummary } from "@inmanta/web-console-test-utils/Data/Resource";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { EnvironmentHealthRow } from "./EnvironmentHealthRow";

// The pages the four columns open: the catalog (lsm), resources and agents (resource manager),
// and the compile reports (orchestration engine).
const linkedRoutes = [
  ...getFeatureRoutes([environmentFeature]),
  stubRoute("Catalog"),
  stubRoute("Resources"),
  stubRoute("CompileReports"),
  stubRoute("Agents"),
];

const columnTitles = [
  words("dashboard.environmentHealth.services"),
  words("resources"),
  words("dashboard.environmentHealth.compiles"),
  words("dashboard.environmentHealth.agents"),
];

const emptyPage = {
  data: [],
  links: { self: "" },
  metadata: { total: 0, before: 0, after: 0, page_size: 1 },
};

// The data of the four columns and the orchestrator card, all empty.
const server = setupServer(
  http.get("/api/v1/serverstatus", () => HttpResponse.json({ data: ServerStatus.withLsm })),
  http.get("/api/v2/project", () => HttpResponse.json({ data: Project.list })),
  http.get("/api/v2/environment", () => HttpResponse.json({ data: Environment.filterable })),
  http.get("/lsm/v1/service_catalog", () => HttpResponse.json({ data: [] })),
  http.get("/api/v2/agents", () => HttpResponse.json(emptyPage)),
  http.get("/api/v2/compilereport", () => HttpResponse.json(emptyPage)),
  graphql.link("/api/v2/graphql").query("GetResources", () =>
    HttpResponse.json({
      data: {
        data: {
          resources: {
            totalCount: 0,
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              endCursor: "",
              startCursor: "",
            },
            edges: [],
          },
          resourceSummary: createMockResourceSummary(),
        },
      },
    })
  )
);

const setup = (routes: RouteFactory[]) =>
  render(
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={["/?env=aaa"]}>
        <MockedDependencyProvider features={[environmentFeature]} routes={routes}>
          <EnvironmentHealthRow />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

const columnAction = (title: string) =>
  screen.queryByLabelText(words("dashboard.environmentHealth.viewDetails")(title));

describe("EnvironmentHealthRow", () => {
  beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
  // The columns only need their titles, which they show before their data loads. Still wait for
  // the requests, so none of them is running when the server closes.
  afterEach(async () => {
    await waitFor(() => expect(testClient.isFetching()).toBe(0));
    testClient.clear();
  });
  afterAll(() => server.close());

  it("makes every column clickable", () => {
    setup(linkedRoutes);

    columnTitles.forEach((title) => expect(columnAction(title)).toBeInTheDocument());
  });

  it("shows the columns without opening anything when the app has none of those pages", () => {
    setup(getFeatureRoutes([environmentFeature]));

    columnTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeVisible();
      expect(columnAction(title)).not.toBeInTheDocument();
    });
  });
});
