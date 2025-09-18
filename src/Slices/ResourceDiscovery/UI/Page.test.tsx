import { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import * as DiscoveredResources from "../Data/Mock";
import { DiscoveredResourcesPage } from ".";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={[""]}>
        <MockedDependencyProvider>
          <Page>
            <DiscoveredResourcesPage />
          </Page>
        </MockedDependencyProvider>
      </TestMemoryRouter>
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
    let callCount = 0;
    server.use(
      http.get("/api/v2/discovered", () => {
        callCount += 1;

        // First call: return full dataset
        if (callCount === 1) {
          return HttpResponse.json(DiscoveredResources.response);
        }

        // Subsequent calls (e.g., after applying a filter): return a filtered subset
        const filtered = DiscoveredResources.response.data.filter((item) => {
          const value = (item.values as { name?: string }).name ?? "";
          return value.toLowerCase().includes("ubuntu");
        });

        return HttpResponse.json({
          data: filtered,
          links: {
            self: "/api/v2/discovered?limit=20&sort=discovered_resource_id.asc&filter.value=ubuntu",
          },
          metadata: {
            total: filtered.length,
            before: 0,
            after: 0,
            page_size: 20,
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

    // Check that the first row shows parsed resource ID components
    expect(within(rows[0]).getByTestId("Type")).toHaveTextContent("VirtualMachine");

    expect(within(rows[0]).getByTestId("Agent")).toHaveTextContent("lab");

    expect(within(rows[0]).getByTestId("Value")).toHaveTextContent("acisim");

    // Check that action buttons are present
    expect(
      within(rows[0]).getByRole("button", {
        name: "Show Details",
      })
    ).toBeVisible();

    // Apply a value filter using the toolbar and verify the table updates
    const user = userEvent.setup();
    const valueInput = screen.getByTestId("ValueFilterInput");
    await user.clear(valueInput);
    await user.type(valueInput, "ubuntu");
    await user.click(
      screen.getByRole("button", {
        name: /submit search/i,
      })
    );

    const filteredRows = await screen.findAllByRole("row", {
      name: "DiscoveredResourceRow",
    });
    expect(filteredRows).toHaveLength(2);

    // Check the filtered results contain expected values
    const firstValue = within(filteredRows[0]).getByTestId("Value");
    const secondValue = within(filteredRows[1]).getByTestId("Value");
    expect(firstValue.textContent + secondValue.textContent).toMatch(/ubuntu/i);

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });
});
