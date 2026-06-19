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

// The code editor is mocked globally in test-setup.ts; no local mock needed.

const valueOf = (name: string) => Mock.list.find((f) => f.name === name)?.value ?? "";

// The mocked editor renders its content into a <pre data-testid="code-editor-content">.
// Scope to it (there is one per expandable row) so we match the formatted value in
// the editor rather than the raw value shown in the preview button.
const editorShowing = (snippet: string) =>
  screen.getAllByTestId("code-editor-content").find((el) => el.textContent?.includes(snippet));

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
  const jsonFactValue = valueOf("jsonValueFact");
  const xmlFactValue = valueOf("xmlValueFact");

  const response = {
    data: Mock.list,
    metadata: {
      total: 10,
      before: 0,
      after: 0,
      page_size: 10,
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

    expect(rows).toHaveLength(10);
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

      expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(10);

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

    expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(10);

    await userEvent.click(screen.getByLabelText("Go to next page"));

    expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(4);

    //sort on the second page
    const resourceIdButton = await screen.findByText("Name");

    expect(resourceIdButton).toBeVisible();

    await userEvent.click(resourceIdButton);

    expect(await screen.findAllByRole("row", { name: "FactsRow" })).toHaveLength(10);
  });

  test("GIVEN Facts page WHEN a row has a JSON value THEN shows a value preview button, otherwise shows the raw value", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("button", { name: jsonFactValue })).toBeVisible();
    expect(screen.getAllByRole("button", { name: jsonFactValue })).toHaveLength(1);

    expect(screen.getByText(Mock.list[0].value)).toBeVisible();
  });

  test("GIVEN Facts page WHEN clicking the value preview THEN the formatted JSON is shown", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: jsonFactValue }));

    // The editor now shows the pretty-printed JSON (a space after the colon that
    // the raw value does not have) — distinctive of the formatted output.
    expect(editorShowing('"status": "deployed"')).toBeVisible();
  });

  test("GIVEN Facts page WHEN a row has an XML value THEN shows a value preview button, otherwise shows the raw value", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("button", { name: xmlFactValue })).toBeVisible();
    expect(screen.getAllByRole("button", { name: xmlFactValue })).toHaveLength(1);
  });

  test("GIVEN Facts page WHEN clicking the XML value preview THEN the formatted XML is shown", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: xmlFactValue }));

    // The editor now shows the formatted XML.
    expect(editorShowing("<host>localhost</host>")).toBeVisible();
  });
});
