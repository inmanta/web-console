import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { RemoteData } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies, EnvironmentDetails, EnvironmentSettings } from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import * as Mock from "@S/CompileReports/Core/Mock";
import { Page } from "./Page";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});
const server = setupServer();

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const store = getStoreInstance();

  const routeManager = PrimaryRouteManager("");

  store.dispatch.environment.setEnvironmentDetailsById({
    id: "env",
    value: RemoteData.success(EnvironmentDetails.a),
  });
  store.dispatch.environment.setSettingsData({
    environment: "env",
    value: RemoteData.success({
      settings: {},
      definition: EnvironmentSettings.definition,
    }),
  });
  dependencies.environmentModifier.setEnvironment("env");

  const component = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            routeManager,
          }}
        >
          <StoreProvider store={store}>
            <Page />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("CompileReportsView shows empty table", async () => {
  server.use(
    http.get("/api/v2/compilereport", () => {
      return HttpResponse.json({
        data: [],
        links: { self: "" },
        metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
      });
    }),
  );
  const { component } = setup();

  render(component);

  expect(
    screen.getByRole("region", { name: "CompileReportsView-Loading" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Empty" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("CompileReportsView shows failed table", async () => {
  server.use(
    http.get("/api/v2/compilereport", () => {
      return HttpResponse.json(
        {
          message: "error",
        },
        {
          status: 500,
        },
      );
    }),
  );
  const { component } = setup();

  render(component);

  expect(
    await screen.findByRole("region", { name: "CompileReportsView-Loading" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("region", { name: "CompileReportsView-Error" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("CompileReportsView shows success table", async () => {
  server.use(
    http.get("/api/v2/compilereport", () => {
      return HttpResponse.json(Mock.response);
    }),
  );
  const { component } = setup();

  render(component);

  expect(
    await screen.findByRole("region", { name: "CompileReportsView-Loading" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("grid", { name: "CompileReportsView-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("CompileReportsView shows updated table", async () => {
  let delay = 0;

  server.use(
    http.get("/api/v2/compilereport", () => {
      if (delay === 0) {
        delay++;

        return HttpResponse.json({
          data: [],
          links: { self: "" },
          metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
        });
      }

      return HttpResponse.json(Mock.response);
    }),
  );

  const { component } = setup();

  render(component);

  expect(
    await screen.findByRole("region", { name: "CompileReportsView-Loading" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Empty" }),
  ).toBeInTheDocument();

  await new Promise((resolve) => setTimeout(resolve, 5000));

  expect(
    await screen.findByRole("grid", { name: "CompileReportsView-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("When using the status filter with the Success option then the successful compile reports should be fetched and shown", async () => {
  server.use(
    http.get("/api/v2/compilereport", ({ request }) => {
      if (request.url.includes("filter.success=true")) {
        return HttpResponse.json({
          ...Mock.response,
          data: Mock.response.data.slice(0, 3),
        });
      }

      return HttpResponse.json(Mock.response);
    }),
  );
  const { component } = setup();

  render(component);

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(initialRows).toHaveLength(8);

  await userEvent.click(
    within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" },
    ),
  );

  const input = screen.getByPlaceholderText(
    words("compileReports.filters.status.placeholder"),
  );

  await userEvent.click(input);

  const option = await screen.findByRole("option", {
    name: words("compileReports.filters.test.success"),
  });

  await userEvent.click(option);

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(rowsAfter).toHaveLength(3);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("When using the status filter with the In Progress opiton then the compile reports of in progress compiles should be fetched and shown", async () => {
  server.use(
    http.get("/api/v2/compilereport", ({ request }) => {
      if (request.url.includes("filter.started=true")) {
        return HttpResponse.json({
          ...Mock.response,
          data: Mock.response.data.slice(0, 3),
        });
      }

      return HttpResponse.json(Mock.response);
    }),
  );
  const { component } = setup();

  render(component);

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(initialRows).toHaveLength(8);

  await userEvent.click(
    within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" },
    ),
  );

  await userEvent.click(
    screen.getByRole("option", {
      name: words("compileReports.columns.status"),
    }),
  );

  const input = screen.getByPlaceholderText(
    words("compileReports.filters.status.placeholder"),
  );

  await userEvent.click(input);

  const option = await screen.findByRole("option", {
    name: words("compileReports.tests.filters.result.inProgress"),
  });

  await userEvent.click(option);

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(rowsAfter).toHaveLength(3);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("When using the Date filter then the compile reports within the range selected range should be fetched and shown", async () => {
  server.use(
    http.get("/api/v2/compilereport", ({ request }) => {
      if (
        request.url.includes(
          "filter.requested=ge%3A2021-09-27%2B22%3A00%3A00&filter.requested=le%3A2021-09-29%2B22%3A00%3A00",
        )
      ) {
        return HttpResponse.json({
          ...Mock.response,
          data: Mock.response.data.slice(0, 3),
        });
      }

      return HttpResponse.json(Mock.response);
    }),
  );
  const { component } = setup();

  render(component);

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(initialRows).toHaveLength(8);

  await userEvent.click(
    within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" },
    ),
  );

  await userEvent.click(
    screen.getByRole("option", {
      name: words("compileReports.columns.requested"),
    }),
  );

  const fromDatePicker = await screen.findByLabelText("From Date Picker");

  await userEvent.type(fromDatePicker, "2021-09-28");

  const toDatePicker = await screen.findByLabelText("To Date Picker");

  await userEvent.type(toDatePicker, "2021-09-30");

  await userEvent.click(await screen.findByLabelText("Apply date filter"));

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(rowsAfter).toHaveLength(3);

  // The chips are hidden in small windows, so resize it
  window = Object.assign(window, { innerWidth: 1200 });
  await act(async () => {
    window.dispatchEvent(new Event("resize"));
  });

  expect(
    await screen.findByText("from | 2021/09/28 00:00:00", { exact: false }),
  ).toBeVisible();
  expect(
    await screen.findByText("to | 2021/09/30 00:00:00", { exact: false }),
  ).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given CompileReportsView When recompile is triggered Then table is updated", async () => {
  let update = false;

  server.use(
    http.get("/api/v2/compilereport", () => {
      if (update) {
        return HttpResponse.json(Mock.response);
      }

      return HttpResponse.json({
        ...Mock.response,
        data: Mock.response.data.slice(0, 3),
      });
    }),
    http.post("/api/v1/notify/env", () => {
      update = true;

      return HttpResponse.json({});
    }),
  );
  const { component } = setup();

  render(component);

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(initialRows).toHaveLength(3);

  const button = screen.getByRole("button", { name: "RecompileButton" });

  expect(button).toBeEnabled();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await userEvent.click(button);

  const updatedRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(updatedRows).toHaveLength(8);
});

test("GIVEN CompileReportsView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
  server.use(
    http.get("/api/v2/compilereport", ({ request }) => {
      if (request.url.includes("end=fake-first-param")) {
        return HttpResponse.json({
          ...Mock.response,
          data: Mock.response.data.slice(0, 3),
        });
      }

      return HttpResponse.json({
        data: Mock.response.data,
        metadata: {
          total: 23,
          before: 0,
          after: 3,
          page_size: 20,
        },
        links: {
          self: Mock.response.links.self,
          next: "/fake-link?end=fake-first-param",
        },
      });
    }),
  );
  const { component } = setup();

  render(component);

  expect(
    await screen.findByRole("grid", { name: "CompileReportsView-Success" }),
  ).toBeInTheDocument();

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(initialRows).toHaveLength(8);

  expect(screen.getByLabelText("Go to next page")).toBeEnabled();

  await userEvent.click(screen.getByLabelText("Go to next page"));

  const updatedRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(updatedRows).toHaveLength(3);

  expect(screen.getByLabelText("Go to next page")).toBeDisabled();

  //sort on the second page
  const resourceIdButton = await screen.findByText("Requested");

  expect(resourceIdButton).toBeVisible();

  await userEvent.click(resourceIdButton);

  const updatedRows2 = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(updatedRows2).toHaveLength(8);

  expect(screen.getByLabelText("Go to next page")).toBeEnabled();
});
