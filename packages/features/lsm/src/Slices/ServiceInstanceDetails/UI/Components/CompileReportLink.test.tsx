import React from "react";
import { render, screen } from "@testing-library/react";
import { getFeatureRoutes, RouteFactory, words } from "@inmanta/web-console-core";
import { lsmFeature } from "@inmanta/web-console-feature-lsm";
import { MockedDependencyProvider, stubRoute } from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { CompileReportLink } from "./CompileReportLink";

const setup = (routes: RouteFactory[]) =>
  render(
    <TestMemoryRouter initialEntries={["/?env=aaa"]}>
      <MockedDependencyProvider features={[lsmFeature]} routes={routes}>
        <CompileReportLink compileId="compile-1" isExport />
      </MockedDependencyProvider>
    </TestMemoryRouter>
  );

describe("CompileReportLink", () => {
  it("links to the compile report", () => {
    setup([...getFeatureRoutes([lsmFeature]), stubRoute("CompileDetails")]);

    expect(screen.getByRole("link", { name: words("export") })).toBeVisible();
  });

  it("shows the kind of compile as text without the orchestration engine", () => {
    setup(getFeatureRoutes([lsmFeature]));

    expect(screen.getByText(words("export"))).toBeVisible();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
