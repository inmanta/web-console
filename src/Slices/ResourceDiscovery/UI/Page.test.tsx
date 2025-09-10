import { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
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

    // Check that the first row shows parsed resource ID components
    expect(
      within(rows[0]).getByTestId("Type")
    ).toHaveTextContent("VirtualMachine");

    expect(
      within(rows[0]).getByTestId("Agent")
    ).toHaveTextContent("vcenter");

    expect(
      within(rows[0]).getByTestId("Value")
    ).toHaveTextContent("lab,name=acisim");

    // Check that action buttons are present
    expect(
      within(rows[0]).getByRole("button", {
        name: "Show details",
      })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

});
