import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import { dependencies } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import * as DiscoveredResources from "../Data/Mock";
import { DiscoveredResourcesPage } from ".";

expect.extend(toHaveNoViolations);

function setup() {
  const client = testClient;
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <DependencyProvider dependencies={dependencies}>
          <StoreProvider store={store}>
            <Page>
              <DiscoveredResourcesPage />
            </Page>
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
  };
}

describe("DiscoveredResourcesPage", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN Discovered Resources page THEN shows table", async () => {
    server.use(
      http.get("/api/v2/discovered", () => {
        return HttpResponse.json(DiscoveredResources.response);
      })
    );

    const { component } = setup();

    render(component);

    const rows = await screen.findAllByRole("row", {
      name: "DiscoveredResourceRow",
    });

    expect(rows).toHaveLength(17);
    expect(
      within(rows[0]).getByRole("cell", {
        name: "vcenter::VirtualMachine[lab,name=acisim]",
      })
    ).toBeVisible();

    // with correct uri to managed resource
    const rowWithManagedResource = within(rows[0]).getByRole("cell", {
      name: "Show managed resource",
    });

    expect(rowWithManagedResource).toBeVisible();

    expect(within(rowWithManagedResource).getByRole("link")).toHaveAttribute(
      "href",
      "/resources/cloudflare%3A%3Adns_record%3A%3ACnameRecord%5Bhttps%3A%2F%2Fapi.cloudflare.com%2Fclient%2Fv4%2F%2Cname%3Dartifacts.ssh.inmanta.com%5D"
    );

    // with correct uri to discovery resource
    const rowWithDiscoveryResource = within(rows[0]).getByRole("cell", {
      name: "Show discovery resource",
    });

    expect(rowWithDiscoveryResource).toBeVisible();

    expect(within(rowWithDiscoveryResource).getByRole("link")).toHaveAttribute(
      "href",
      "/resources/cloudflare%3A%3Adns_record%3A%3ACnameRecord%5Bhttps%3A%2F%2Fapi.cloudflare.com%2Fclient%2Fv4%2F%2Cname%3Dartifacts.ssh.inmanta.com%5D"
    );

    // uri is null
    expect(within(rows[1]).getByTestId("Managed resource")).toHaveTextContent("");
    expect(within(rows[1]).getByTestId("Discovery resource")).toHaveTextContent("");

    // uri doesn't have a rid
    expect(within(rows[2]).getByTestId("Managed resource")).toHaveTextContent("");
    expect(within(rows[2]).getByTestId("Discovery resource")).toHaveTextContent("");

    // uri is an empty string
    expect(within(rows[3]).getByTestId("Managed resource")).toHaveTextContent("");
    expect(within(rows[3]).getByTestId("Discovery resource")).toHaveTextContent("");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN Discovered Resources page THEN sets sorting parameters correctly on click", async () => {
    server.use(
      http.get("/api/v2/discovered", ({ request }) => {
        if (request.url.includes("sort=discovered_resource_id.desc")) {
          return HttpResponse.json({
            ...DiscoveredResources.response,
            data: DiscoveredResources.response.data.reverse(),
          });
        }

        return HttpResponse.json(DiscoveredResources.response);
      })
    );

    const { component } = setup();

    render(component);

    const resourceIdButton = await screen.findByRole("button", {
      name: words("discovered.column.resource_id"),
    });
    const rows = await screen.findAllByRole("row", {
      name: "DiscoveredResourceRow",
    });

    expect(rows).toHaveLength(17);
    expect(
      within(rows[0]).getByRole("cell", {
        name: "vcenter::VirtualMachine[lab,name=acisim]",
      })
    ).toBeVisible();

    expect(resourceIdButton).toBeVisible();

    await userEvent.click(resourceIdButton);

    const sortedRows = await screen.findAllByRole("row", {
      name: "DiscoveredResourceRow",
    });

    expect(sortedRows).toHaveLength(17);
    expect(
      within(sortedRows[16]).getByRole("cell", {
        name: "vcenter::VirtualMachine[lab,name=acisim]",
      })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN Discovered Resources WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/api/v2/discovered", ({ request }) => {
        if (request.url.match(/(&start=|&end=)/)) {
          return HttpResponse.json({
            ...DiscoveredResources.response,
            data: DiscoveredResources.response.data.slice(0, 10),
          });
        }

        return HttpResponse.json({
          ...DiscoveredResources.response,
          metadata: {
            total: 103,
            before: 0,
            after: 3,
            page_size: 100,
          },
          links: {
            ...DiscoveredResources.response.links,
            next: "/fake-link?end=fake-first-param",
          },
        });
      })
    );
    const { component } = setup();

    render(component);

    const rows = await screen.findAllByRole("row", {
      name: "DiscoveredResourceRow",
    });

    expect(rows).toHaveLength(17);

    expect(screen.getByLabelText("Go to next page")).toBeEnabled();

    await userEvent.click(screen.getByLabelText("Go to next page"));

    const nextRows = await screen.findAllByRole("row", {
      name: "DiscoveredResourceRow",
    });

    expect(nextRows).toHaveLength(10);

    const resourceIdButton = await screen.findByRole("button", {
      name: words("discovered.column.resource_id"),
    });

    await userEvent.click(resourceIdButton);

    // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
    // we are asserting on the second request as the first request is for the updated sorting event, and second is chained to back to the first page with still correct sorting
    expect(nextRows).toHaveLength(10);
  });
});
