import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { getFeatureRoutes, RouteFactory, words } from "@inmanta/web-console-core";
import { environmentFeature } from "@inmanta/web-console-feature-environment";
import { MockedDependencyProvider, stubRoute } from "@inmanta/web-console-test-utils";
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
  // The columns only need their titles, which they show before their data loads.
  afterEach(() => testClient.clear());

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
