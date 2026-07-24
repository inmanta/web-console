import { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import * as Parameters from "@S/Parameters/Data/Mock";
import { ParametersPage } from ".";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <Page>
            <ParametersPage />
          </Page>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("ParametersPage", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });
  beforeEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  test("When using the name filter then only the matching parameters should be fetched and shown", async () => {
    server.use(
      http.get("/api/v2/parameters", ({ request }) => {
        if (request.url.includes("&filter.name=param")) {
          return HttpResponse.json({
            ...Parameters.response,
            data: Parameters.response.data.slice(0, 3),
          });
        }

        return HttpResponse.json(Parameters.response);
      })
    );

    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "Parameters Table Row",
    });

    expect(initialRows).toHaveLength(10);

    await userEvent.click(screen.getByRole("button", { name: /Filters/i }));

    const input = screen.getByPlaceholderText(words("parameters.filters.name.placeholder"));

    await userEvent.type(input, "param{enter}");

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Parameters Table Row",
    });

    expect(rowsAfter).toHaveLength(3);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("When using the source filter then only the matching parameters should be fetched and shown", async () => {
    server.use(
      http.get("/api/v2/parameters", ({ request }) => {
        if (request.url.includes("&filter.source=plugin")) {
          return HttpResponse.json({
            ...Parameters.response,
            data: Parameters.response.data.slice(0, 3),
          });
        }

        return HttpResponse.json(Parameters.response);
      })
    );

    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "Parameters Table Row",
    });

    expect(initialRows).toHaveLength(10);

    await userEvent.click(screen.getByRole("button", { name: /Filters/i }));

    const input = screen.getByPlaceholderText(words("parameters.filters.source.placeholder"));

    await userEvent.type(input, "plugin{enter}");

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Parameters Table Row",
    });

    expect(rowsAfter).toHaveLength(3);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("When using the Updated filter then the parameters within the range selected range should be fetched and shown", async () => {
    server.use(
      http.get("/api/v2/parameters", ({ request }) => {
        if (
          request.url.includes(
            "&filter.updated=ge%3A2022-01-30%2B23%3A00%3A00&filter.updated=le%3A2022-01-31%2B23%3A00%3A00"
          )
        ) {
          return HttpResponse.json({
            ...Parameters.response,
            data: Parameters.response.data.slice(0, 3),
          });
        }

        return HttpResponse.json(Parameters.response);
      })
    );

    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "Parameters Table Row",
    });

    expect(initialRows).toHaveLength(10);

    await userEvent.click(screen.getByRole("button", { name: /Filters/i }));

    const fromDatePicker = screen.getByLabelText("From Date Picker");

    await userEvent.type(fromDatePicker, "2022/01/31");

    await userEvent.click(screen.getByLabelText("Apply date from filter"));

    const toDatePicker = screen.getByLabelText("To Date Picker");

    await userEvent.type(toDatePicker, "2022-02-01");

    await userEvent.click(screen.getByLabelText("Apply date to filter"));

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Parameters Table Row",
    });

    expect(rowsAfter).toHaveLength(3);

    expect(await screen.findByText("from | 2022/01/31 00:00:00", { exact: false })).toBeVisible();
    expect(await screen.findByText("to | 2022/02/01 00:00:00", { exact: false })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ParametersView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/api/v2/parameters", ({ request }) => {
        if (request.url.includes("end=fake-first-param")) {
          return HttpResponse.json({
            ...Parameters.response,
            data: Parameters.response.data.slice(0, 3),
          });
        }

        return HttpResponse.json({
          ...Parameters.response,
          links: {
            ...Parameters.response.links,
            next: "/fake-link?end=fake-first-param",
          },
          metadata: {
            total: 103,
            before: 0,
            after: 83,
            page_size: 100,
          },
        });
      })
    );
    const { component } = setup();

    render(component);

    const initialRows = await screen.findAllByRole("row", {
      name: "Parameters Table Row",
    });

    expect(initialRows).toHaveLength(10);

    await userEvent.click(screen.getByLabelText("Go to next page"));

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Parameters Table Row",
    });

    expect(rowsAfter).toHaveLength(3);

    //sort on the second page
    const resourceIdButton = await screen.findByRole("button", {
      name: "Name",
    });

    expect(resourceIdButton).toBeVisible();

    await userEvent.click(resourceIdButton);

    const initialRows2 = await screen.findAllByRole("row", {
      name: "Parameters Table Row",
    });

    expect(initialRows2).toHaveLength(10);
  });

  test("When a parameter has a long value Then it renders an expandable preview that reveals the code editor", async () => {
    server.use(http.get("/api/v2/parameters", () => HttpResponse.json(Parameters.response)));

    const { component } = setup();

    render(component);

    const longValue =
      Parameters.response.data.find((parameter) => parameter.name === "different_param")?.value ??
      "";

    // A long value is now classified as expandable: the cell renders a preview
    // button (rather than the previous plain truncated cell) that reveals the
    // value in the mocked code editor (test-setup.ts). The button label is a
    // middle-truncated form of the value, so match on its distinctive tail.
    const [preview] = await screen.findAllByRole("button", { name: /long value$/ });

    await userEvent.click(preview);

    // The editor renders the value verbatim (whitespace preserved), so the full
    // fixture value appears in its content.
    const editor = screen
      .getAllByTestId("code-editor-content")
      .find((element) => element.textContent?.includes(longValue));

    expect(editor).toBeVisible();
  });
});
