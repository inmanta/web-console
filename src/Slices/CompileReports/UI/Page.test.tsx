import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  KeycloakAuthHelper,
  QueryManagerResolver,
  CommandManagerResolver,
} from "@/Data";
import {
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
  EnvironmentDetails,
  EnvironmentSettings,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import * as Mock from "@S/CompileReports/Core/Mock";
import { Page } from "./Page";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper)
  );

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
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          routeManager,
        }}
      >
        <StoreProvider store={store}>
          <Page />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("CompileReportsView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [],
        links: { self: "" },
        metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
      })
    );
  });

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Empty" })
  ).toBeInTheDocument();
});

test("CompileReportsView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(Either.left("error"));
  });

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Failed" })
  ).toBeInTheDocument();
});

test("CompileReportsView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  expect(
    await screen.findByRole("grid", { name: "CompileReportsView-Success" })
  ).toBeInTheDocument();
});

test("CompileReportsView shows updated table", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: [],
        links: { self: "" },
        metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
      })
    );
  });

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Empty" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  await act(async () => {
    await apiHelper.resolve(204);
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  expect(
    await screen.findByRole("grid", { name: "CompileReportsView-Success" })
  ).toBeInTheDocument();
});

test("When using the status filter with the Success option then the successful compile reports should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(initialRows).toHaveLength(8);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" }
      )
    );
  });

  const input = screen.getByPlaceholderText(
    words("compileReports.filters.status.placeholder")
  );

  await act(async () => {
    await userEvent.click(input);
  });

  const option = await screen.findByRole("option", {
    name: words("compileReports.filters.test.success"),
  });
  await act(async () => {
    await userEvent.click(option);
  });

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/compilereport?limit=20&sort=requested.desc&filter.success=true`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Mock.response,
        data: Mock.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });
  expect(rowsAfter).toHaveLength(3);
});

test("When using the status filter with the In Progress opiton then the compile reports of in progress compiles should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(initialRows).toHaveLength(8);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" }
      )
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", {
        name: words("compileReports.columns.status"),
      })
    );
  });

  const input = screen.getByPlaceholderText(
    words("compileReports.filters.status.placeholder")
  );
  await act(async () => {
    await userEvent.click(input);
  });

  const option = await screen.findByRole("option", {
    name: words("compileReports.tests.filters.result.inProgress"),
  });

  await act(async () => {
    await userEvent.click(option);
  });

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/compilereport?limit=20&sort=requested.desc&filter.started=true&filter.completed=false`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Mock.response,
        data: Mock.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });
  expect(rowsAfter).toHaveLength(3);
});

it("When using the Date filter then the compile reports within the range selected range should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });

  expect(initialRows).toHaveLength(8);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" }
      )
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", {
        name: words("compileReports.columns.requested"),
      })
    );
  });

  const fromDatePicker = await screen.findByLabelText("From Date Picker");
  await act(async () => {
    await userEvent.click(fromDatePicker);
  });
  await act(async () => {
    await userEvent.type(fromDatePicker, "2021-09-28");
  });

  const toDatePicker = await screen.findByLabelText("To Date Picker");

  await act(async () => {
    await userEvent.click(toDatePicker);
    await userEvent.type(toDatePicker, "2021-09-30");
  });
  await act(async () => {
    await userEvent.click(await screen.findByLabelText("Apply date filter"));
  });

  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/api/v2/compilereport?limit=20&sort=requested.desc&filter.requested=ge%3A2021-09-`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Mock.response,
        data: Mock.response.data.slice(0, 3),
      })
    );
  });

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
    await screen.findByText("from | 2021/09/28 00:00:00", { exact: false })
  ).toBeVisible();
  expect(
    await screen.findByText("to | 2021/09/30 00:00:00", { exact: false })
  ).toBeVisible();
});

test("Given CompileReportsView When recompile is triggered Then table is updated", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(204);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.response));
  });

  const button = screen.getByRole("button", { name: "RecompileButton" });

  expect(button).toBeEnabled();

  await act(async () => {
    await userEvent.click(button);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({}));
  });

  await act(async () => {
    await apiHelper.resolve(200);
  });

  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      url: "/api/v2/compilereport?limit=20&sort=requested.desc",
      environment: "env",
    },
  ]);
});
