import React from "react";
import { ApolloProvider } from "@apollo/client/react";
import { act, render, screen, within } from "@testing-library/react";
import { Sort, Resource as ResourceDomain } from "@/Core";
import { createApolloClient } from "@/Data/Apollo";
import { Resource } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ResourceTableRow_Fragment } from "./ResourceTableRow";
import { ResourcesTable } from "./ResourcesTable";
import { createResourcesTablePresenter } from "./ResourcesTablePresenter";

const routeManager = PrimaryRouteManager("");
const defaultSort: Sort.Sort<ResourceDomain.SortKey>[] = [{ name: "resource_type", order: "asc" }];
const nodes = Resource.response.data.resources.edges.slice(0, 3).map(({ node }) => node);

/** Writes a fixture resource to the cache the way the page query would normalize it. */
function writeResource(
  client: ReturnType<typeof createApolloClient>,
  node: (typeof nodes)[number]
) {
  client.cache.writeFragment({ fragment: ResourceTableRow_Fragment, data: node });
}

function setup() {
  const client = createApolloClient({ getToken: () => null });
  nodes.forEach((node) => writeResource(client, node));

  const refs = nodes.map(({ resourceId }) => ({ __typename: "Resource" as const, resourceId }));
  const component = (
    <ApolloProvider client={client}>
      <TestMemoryRouter initialEntries={["/"]}>
        <DependencyProvider dependencies={{ routeManager }}>
          <ResourcesTable
            resources={refs}
            loadingRowCount={nodes.length}
            sort={defaultSort}
            setSort={vi.fn()}
          />
        </DependencyProvider>
      </TestMemoryRouter>
    </ApolloProvider>
  );

  return { client, component };
}

describe("ResourcesTable", () => {
  it("renders a row for each resource from the cache", () => {
    const { component } = setup();

    render(component);

    nodes.forEach(({ resourceIdValue }) => {
      expect(screen.getByText(resourceIdValue)).toBeInTheDocument();
    });
  });

  it("updates a row when its resource changes in the cache", async () => {
    const { client, component } = setup();
    const [first] = nodes;
    const updatedValue = `${first.resourceIdValue}-updated`;

    render(component);

    act(() => writeResource(client, { ...first, resourceIdValue: updatedValue }));

    expect(await screen.findByText(updatedValue)).toBeInTheDocument();
    expect(screen.queryByText(first.resourceIdValue)).not.toBeInTheDocument();
  });

  it("shows the column headers with placeholder rows while the resources load", () => {
    const loadingRowCount = 4;

    render(
      <TestMemoryRouter initialEntries={["/"]}>
        <DependencyProvider dependencies={{ routeManager }}>
          <ResourcesTable
            aria-label="ResourcesPage-Loading"
            resources={undefined}
            loadingRowCount={loadingRowCount}
            sort={defaultSort}
            setSort={vi.fn()}
          />
        </DependencyProvider>
      </TestMemoryRouter>
    );

    const table = screen.getByRole("grid", { name: "ResourcesPage-Loading" });

    createResourcesTablePresenter()
      .getColumnHeads()
      .filter(({ apiName }) => apiName !== "status")
      .forEach(({ displayName }) => {
        expect(within(table).getByRole("columnheader", { name: displayName })).toBeInTheDocument();
      });
    // The placeholder rows are hidden from assistive technology, so count them in the DOM.
    expect(table.querySelectorAll("tbody tr")).toHaveLength(loadingRowCount);
    expect(screen.queryByLabelText("Resource Table Row")).not.toBeInTheDocument();
  });
});
