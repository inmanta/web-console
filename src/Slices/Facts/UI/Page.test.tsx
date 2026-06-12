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
import { VALUE_PREVIEW_LENGTH } from "./helpers";
import { FactsPage } from ".";

vi.mock("@patternfly/react-code-editor", () => ({
  CodeEditor: ({
    code,
    customControls,
    isDownloadEnabled,
  }: {
    code: string;
    customControls?: React.ReactNode;
    isDownloadEnabled?: boolean;
  }) => (
    <div>
      <pre>{code}</pre>
      {customControls}
      {isDownloadEnabled && <button aria-label="Download code" />}
    </div>
  ),
  CodeEditorControl: ({
    onClick,
    "aria-label": ariaLabel,
  }: {
    onClick: () => void;
    "aria-label": string;
  }) => <button onClick={onClick} aria-label={ariaLabel} />,
  Language: { json: "json", xml: "xml" },
}));

const previewOf = (name: string) => {
  const value = Mock.list.find((f) => f.name === name)?.value;

  return `${value?.slice(0, VALUE_PREVIEW_LENGTH)}…`;
};

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
  const jsonFactValuePreview = previewOf("jsonValueFact");
  const xmlFactValuePreview = previewOf("xmlValueFact");

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

    expect(await screen.findByRole("button", { name: jsonFactValuePreview })).toBeVisible();
    expect(screen.getAllByRole("button", { name: jsonFactValuePreview })).toHaveLength(1);

    // Plain-text values are directly visible as cells, not wrapped in buttons
    expect(screen.getByRole("cell", { name: Mock.list[0].value })).toBeVisible();
  });

  test("GIVEN Facts page WHEN clicking the value preview THEN formatted JSON and a copy button are shown", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: jsonFactValuePreview }));

    // Formatted JSON content is now visible — check for a distinctive key/value pair
    expect(
      await screen.findByText((content) => content.includes('"status": "deployed"'))
    ).toBeVisible();

    expect(screen.getByRole("button", { name: words("copy") })).toBeVisible();
    expect(screen.getByRole("button", { name: "Download code" })).toBeVisible();
  });

  test("GIVEN Facts page WHEN a row has an XML value THEN shows a value preview button, otherwise shows the raw value", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("button", { name: xmlFactValuePreview })).toBeVisible();
    expect(screen.getAllByRole("button", { name: xmlFactValuePreview })).toHaveLength(1);
  });

  test("GIVEN Facts page WHEN clicking the XML value preview THEN XML and a copy button are shown", async () => {
    server.use(
      http.get("/api/v2/facts", () => {
        return HttpResponse.json(response);
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: xmlFactValuePreview }));

    // Formatted XML is visible — check for a distinctive tag
    expect(
      await screen.findByText((content) => content.includes("<host>localhost</host>"))
    ).toBeVisible();

    expect(screen.getByRole("button", { name: words("copy") })).toBeVisible();
    expect(screen.getByRole("button", { name: "Download code" })).toBeVisible();
  });
});
