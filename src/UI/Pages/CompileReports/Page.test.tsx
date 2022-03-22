import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CompileReportsQueryManager,
  CompileReportsStateHelper,
  GetCompilerStatusQueryManager,
  CommandResolverImpl,
  TriggerCompileCommandManager,
} from "@/Data";
import {
  DynamicQueryManagerResolver,
  StaticScheduler,
  CompileReportsData,
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new CompileReportsQueryManager(
        apiHelper,
        new CompileReportsStateHelper(store),
        scheduler
      ),
      new GetCompilerStatusQueryManager(apiHelper, scheduler),
    ])
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new TriggerCompileCommandManager(apiHelper),
    ])
  );

  const routeManager = new PrimaryRouteManager("");

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

  apiHelper.resolve(204);

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Empty" })
  ).toBeInTheDocument();
});

test("CompileReportsView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Failed" })
  ).toBeInTheDocument();
});

test("CompileReportsView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right(CompileReportsData.response));

  expect(
    await screen.findByRole("grid", { name: "CompileReportsView-Success" })
  ).toBeInTheDocument();
});

test("CompileReportsView shows updated table", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  apiHelper.resolve(204);

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Empty" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(204);
  apiHelper.resolve(Either.right(CompileReportsData.response));

  expect(
    await screen.findByRole("grid", { name: "CompileReportsView-Success" })
  ).toBeInTheDocument();
});

test("When using the result filter with the Successful option then the successful compile reports should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  await act(async () => {
    await apiHelper.resolve(Either.right(CompileReportsData.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });
  expect(initialRows).toHaveLength(8);

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Result" }));

  const input = screen.getByRole("button", { name: "Select Result" });
  userEvent.click(input);

  const option = await screen.findByRole("option", { name: "Successful" });
  await userEvent.click(option);

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/compilereport?limit=20&sort=requested.desc&filter.success=true`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...CompileReportsData.response,
        data: CompileReportsData.response.data.slice(0, 3),
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

  apiHelper.resolve(204);

  await act(async () => {
    await apiHelper.resolve(Either.right(CompileReportsData.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });
  expect(initialRows).toHaveLength(8);

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Status" }));

  const input = screen.getByPlaceholderText("Select compile status...");
  userEvent.click(input);

  const option = await screen.findByRole("option", { name: "In Progress" });
  await userEvent.click(option);

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/compilereport?limit=20&sort=requested.desc&filter.completed=false&filter.started=true`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...CompileReportsData.response,
        data: CompileReportsData.response.data.slice(0, 3),
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

  apiHelper.resolve(204);

  await act(async () => {
    await apiHelper.resolve(Either.right(CompileReportsData.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });
  expect(initialRows).toHaveLength(8);

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Requested" }));

  const fromDatePicker = await screen.findByLabelText("From Date Picker");
  userEvent.click(fromDatePicker);
  userEvent.type(fromDatePicker, `2021-09-28`);
  const toDatePicker = await screen.findByLabelText("To Date Picker");
  userEvent.click(toDatePicker);
  userEvent.type(toDatePicker, `2021-09-30`);

  userEvent.click(await screen.findByLabelText("Apply date filter"));

  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/api/v2/compilereport?limit=20&sort=requested.desc&filter.requested=ge%3A2021-09-`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...CompileReportsData.response,
        data: CompileReportsData.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Compile Reports Table Row",
  });
  expect(rowsAfter).toHaveLength(3);

  // The chips are hidden in small windows, so resize it
  window = Object.assign(window, { innerWidth: 1200 });
  window.dispatchEvent(new Event("resize"));
  expect(
    await screen.findByText("from | 2021/09/28 00:00:00", { exact: false })
  ).toBeVisible();
  expect(
    await screen.findByText("to | 2021/09/30 00:00:00", { exact: false })
  ).toBeVisible();
});
