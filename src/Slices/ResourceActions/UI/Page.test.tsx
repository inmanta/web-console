import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { mockResourceActionsResponse } from "@S/ResourceActions/Test";
import { ResourceActionsPage } from ".";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <Page>
            <ResourceActionsPage />
          </Page>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("ResourceActionsPage", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN the changelog page THEN it shows the resource actions in a table", async () => {
    server.use(
      http.get("/api/v2/resource_actions", () => HttpResponse.json(mockResourceActionsResponse))
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("grid", { name: "ResourceActionsTable" })).toBeVisible();

    const rows = screen.getAllByLabelText("ResourceActionRow");

    expect(rows).toHaveLength(2);
    expect(await axe(document.body)).toHaveNoViolations();
  });

  test("GIVEN the changelog page THEN the default filter excludes only nochange", async () => {
    let requestUrl = "";

    server.use(
      http.get("/api/v2/resource_actions", ({ request }) => {
        requestUrl = request.url;

        return HttpResponse.json(mockResourceActionsResponse);
      })
    );
    const { component } = setup();

    render(component);

    await screen.findByRole("grid", { name: "ResourceActionsTable" });

    expect(requestUrl).toContain("exclude_changes=nochange");
    expect(requestUrl).not.toContain("exclude_changes=created");
    expect(requestUrl).not.toContain("exclude_changes=updated");
    expect(requestUrl).not.toContain("exclude_changes=purged");
  });

  test("GIVEN the changelog page WHEN a row is expanded THEN the details and logs link are shown", async () => {
    server.use(
      http.get("/api/v2/resource_actions", () => HttpResponse.json(mockResourceActionsResponse))
    );
    const { component } = setup();

    render(component);

    await screen.findByRole("grid", { name: "ResourceActionsTable" });

    const firstRow = screen.getAllByLabelText("ResourceActionRow")[0];

    await userEvent.click(within(firstRow).getByRole("button", { name: "Details" }));

    const details = await screen.findByLabelText("ResourceAction-Details");

    expect(within(details).getByText("ebea32fe-aec5-409b-ba17-8aac2b51df91")).toBeVisible();

    const logsLink = screen.getByRole("link", { name: /View logs/ });
    const href = decodeURIComponent(logsLink.getAttribute("href") ?? "");

    expect(href).toContain("state.ResourceDetails.tab=Logs");
    expect(href).toContain("state.ResourceDetails.filter.action[0]=deploy");
    expect(href).toContain("state.ResourceDetails.filter.timestamp[0]=from__");
    expect(href).toContain("state.ResourceDetails.filter.timestamp[1]=to__");
  });

  test("GIVEN the changelog page WHEN the API errors THEN an error view is shown", async () => {
    server.use(
      http.get("/api/v2/resource_actions", () =>
        HttpResponse.json({ message: "boom" }, { status: 500 })
      )
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByLabelText("ResourceActions-Failed")).toBeVisible();
  });
});
