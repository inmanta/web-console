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
import { Mock } from "@S/Facts/Test";
import { FactsPage } from ".";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <Page>
            <FactsPage />
          </Page>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
  };
}

describe("FactsPage", () => {
  const response = {
    data: Mock.list,
    metadata: {
      total: 8,
      before: 0,
      after: 0,
      page_size: 8,
    },
    links: { self: "" },
  };
  const server = setupServer();

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN Facts page THEN shows table", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    const rows = await screen.findAllByRole("row", { name: "FactsRow" });

    expect(rows).toHaveLength(8);
    expect(within(rows[0]).getByRole("cell", { name: "awsDevice" })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN Facts page THEN sets sorting parameters correctly on click", async () => {
    let sorting = "";
    server.use(
      http.get("/api/v2/facts", ({ request }) => {
        const url = new URL(request.url);
        sorting = url.searchParams.get("sort") || "";

        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    const resourceIdButton = await screen.findByRole("button", {
      name: words("facts.column.resourceId"),
    });

    expect(resourceIdButton).toBeVisible();

    await userEvent.click(resourceIdButton);

    expect(sorting).toEqual("resource_id.asc");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test.each`
    filterValue      | placeholderText                                  | filterUrlName
    ${"awsDeviceV2"} | ${words("facts.filters.name.placeholder")}       | ${"name"}
    ${"id123"}       | ${words("facts.filters.resourceId.placeholder")} | ${"resource_id"}
  `(
    "When using the $filterName filter of type $filterType with value $filterValue and text $placeholderText then the facts with that $filterUrlName should be fetched and shown",
    async ({ filterValue, placeholderText, filterUrlName }) => {
      server.use(
        http.get("/api/v2/facts", ({ request }) => {
          if (request.url.includes(`&filter.${filterUrlName}=${filterValue}`)) {
            return HttpResponse.json({
              ...response,
              data: response.data.slice(0, 4),
            });
          }

          return HttpResponse.json(response);
        })
      );
      const { component } = setup();

      render(component);

      expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(8);

      const input = await screen.findByPlaceholderText(placeholderText);

      await userEvent.type(input, `${filterValue}{enter}`);

      expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(4);

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    }
  );

  test("GIVEN FactsView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/api/v2/facts", ({ request }) => {
        if (request.url.includes("&end=fake-first-param")) {
          return HttpResponse.json({
            ...response,
            data: response.data.slice(0, 4),
          });
        }

        return HttpResponse.json({
          data: Mock.list,
          metadata: {
            total: 103,
            before: 0,
            after: 3,
            page_size: 100,
          },
          links: {
            self: "",
            next: "/fake-link?end=fake-first-param",
          },
        });
      })
    );

    const { component } = setup();

    render(component);

    expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(8);

    await userEvent.click(screen.getByLabelText("Go to next page"));

    expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(4);

    //sort on the second page
    const resourceIdButton = await screen.findByText("Name");

    expect(resourceIdButton).toBeVisible();

    await userEvent.click(resourceIdButton);

    expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(8);
  });

  test("GIVEN Facts page WHEN a row has a JSON value THEN shows 'View Value' button, otherwise shows the raw value", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json({
          data: [Mock.jsonFact, Mock.list[0]],
          metadata: { total: 2, before: 0, after: 0, page_size: 10 },
          links: { self: "" },
        });
      })
    );
    const { component } = setup();

    render(component);

    // Wait for the JSON row's button to appear — implicitly waits for the correct data to load
    expect(await screen.findByRole("button", { name: words("facts.value.viewButton") })).toBeVisible();

    // Exactly one "View Value" button — the plain-text row doesn't get one
    expect(screen.getAllByRole("button", { name: words("facts.value.viewButton") })).toHaveLength(1);

    // The plain-text value is directly visible as a cell, no button wrapping it
    expect(screen.getByRole("cell", { name: Mock.list[0].value })).toBeVisible();
  });

  test("GIVEN Facts page WHEN clicking 'View Value' THEN formatted JSON and a copy button are shown", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json({
          data: [Mock.jsonFact],
          metadata: { total: 1, before: 0, after: 0, page_size: 10 },
          links: { self: "" },
        });
      })
    );
    const { component } = setup();

    render(component);

    const viewValueButton = await screen.findByRole("button", {
      name: words("facts.value.viewButton"),
    });

    await userEvent.click(viewValueButton);

    // Formatted JSON content is now visible — check for a distinctive key/value pair
    expect(
      await screen.findByText((content) => content.includes('"status": "deployed"'))
    ).toBeVisible();

    // Copy button rendered by ClipboardCopyButton inside CodeBlockAction
    expect(screen.getByRole("button", { name: "Copy to clipboard" })).toBeVisible();
  });
});
