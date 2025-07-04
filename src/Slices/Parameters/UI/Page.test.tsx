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

    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole("button", {
        name: "FilterPicker",
      })
    );

    await userEvent.click(screen.getByRole("option", { name: words("parameters.columns.source") }));

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

    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole("button", {
        name: "FilterPicker",
      })
    );

    await userEvent.click(
      screen.getByRole("option", {
        name: words("parameters.columns.updated.tests"),
      })
    );

    const fromDatePicker = screen.getByLabelText("From Date Picker");

    await userEvent.type(fromDatePicker, "2022/01/31");

    const toDatePicker = screen.getByLabelText("To Date Picker");

    await userEvent.type(toDatePicker, "2022-02-01");

    await userEvent.click(screen.getByLabelText("Apply date filter"));

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Parameters Table Row",
    });

    expect(rowsAfter).toHaveLength(3);

    // The chips are hidden in small windows, so resize it
    window = Object.assign(window, { innerWidth: 1200 });
    await act(async () => {
      window.dispatchEvent(new Event("resize"));
    });

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
});
