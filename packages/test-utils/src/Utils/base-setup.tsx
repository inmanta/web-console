import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { FeatureModule, getFeatureRoutes, RouteFactory } from "@inmanta/web-console-core";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { BlockingModal } from "@inmanta/web-console-ui/Components/BlockingModal";
import { TestMemoryRouter } from "./TestMemoryRouter";
import { testClient } from "./react-query-setup";

/**
 * Renders a page with the dependencies, router and query client of a test.
 *
 * @param Page - the page to render
 * @param features - the features whose pages the page links to
 * @param routes - the registered routes. Defaults to the routes of `features`.
 * @returns the component to render
 */
export function baseSetup(
  Page: React.ReactNode,
  features: FeatureModule[] = [],
  routes: RouteFactory[] = getFeatureRoutes(features)
) {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={["/"]}>
        <MockedDependencyProvider features={features} routes={routes}>
          <BlockingModal />
          {Page}
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}
