import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, Maybe } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  PromoteVersionCommandManager,
  DesiredStatesUpdater,
  GetCompilerStatusQueryManager,
  TriggerCompileCommandManager,
} from "@/Data";
import {
  DynamicQueryManagerResolver,
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  GetDesiredStatesQueryManager,
  GetDesiredStatesStateHelper,
} from "@S/DesiredState/Data";
import * as DesiredStateVersions from "@S/DesiredState/Data/Mock";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const getDesiredStatesStateHelper = new GetDesiredStatesStateHelper(store);
  const desiredStatesUpdater = new DesiredStatesUpdater(
    getDesiredStatesStateHelper,
    apiHelper
  );
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetDesiredStatesQueryManager(
        apiHelper,
        getDesiredStatesStateHelper,
        scheduler
      ),
      new GetCompilerStatusQueryManager(apiHelper, scheduler),
    ])
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new PromoteVersionCommandManager(apiHelper, desiredStatesUpdater),
      new TriggerCompileCommandManager(apiHelper),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
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

test("DesiredStatesView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  expect(
    await screen.findByRole("generic", { name: "DesiredStatesView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "DesiredStatesView-Empty" })
  ).toBeInTheDocument();
});

test("DesiredStatesView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  expect(
    await screen.findByRole("generic", { name: "DesiredStatesView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "DesiredStatesView-Failed" })
  ).toBeInTheDocument();
});

test("AgentsView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  expect(
    await screen.findByRole("generic", { name: "DesiredStatesView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right(DesiredStateVersions.response));

  expect(
    await screen.findByRole("grid", { name: "DesiredStatesView-Success" })
  ).toBeInTheDocument();
});

test("When using the status filter then only the matching desired states should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });
  expect(initialRows).toHaveLength(9);

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Status" }));

  const input = screen.getByPlaceholderText("Select status...");
  userEvent.click(input);

  const option = await screen.findByRole("option", {
    name: "skipped_candidate",
  });
  await userEvent.click(option);

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=skipped_candidate`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...DesiredStateVersions.response,
        data: DesiredStateVersions.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });
  expect(rowsAfter).toHaveLength(3);
});

test("When using the Date filter then the desired state versions within the range selected range should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });
  expect(initialRows).toHaveLength(9);

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Date" }));

  const fromDatePicker = screen.getByLabelText("From Date Picker");
  userEvent.click(fromDatePicker);
  userEvent.type(fromDatePicker, `2021-12-06`);
  const toDatePicker = screen.getByLabelText("To Date Picker");
  userEvent.click(toDatePicker);
  userEvent.type(toDatePicker, `2021-12-07`);

  userEvent.click(screen.getByLabelText("Apply date filter"));

  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired&filter.date=ge%3A2021-12-05%2B23%3A00%3A00&filter.date=le%3A2021-12-06%2B23%3A00%3A00`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...DesiredStateVersions.response,
        data: DesiredStateVersions.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });
  expect(rowsAfter).toHaveLength(3);

  // The chips are hidden in small windows, so resize it
  window = Object.assign(window, { innerWidth: 1200 });
  window.dispatchEvent(new Event("resize"));
  expect(
    await screen.findByText("from | 2021/12/06 00:00:00", { exact: false })
  ).toBeVisible();
  expect(
    await screen.findByText("to | 2021/12/07 00:00:00", { exact: false })
  ).toBeVisible();
});

test("When using the Version filter then the desired state versions within the range selected range should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });
  expect(initialRows).toHaveLength(9);

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Version" }));

  const fromDatePicker = await screen.findByLabelText("Version range from");
  userEvent.click(fromDatePicker);
  userEvent.type(fromDatePicker, `3`);
  const toDatePicker = await screen.findByLabelText("Version range to");
  userEvent.click(toDatePicker);
  userEvent.type(toDatePicker, `5`);

  userEvent.click(await screen.findByLabelText("Apply Version filter"));

  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired&filter.version=ge%3A3&filter.version=le%3A5`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...DesiredStateVersions.response,
        data: DesiredStateVersions.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });
  expect(rowsAfter).toHaveLength(3);

  // The chips are hidden in small windows, so resize it
  window = Object.assign(window, { innerWidth: 1200 });
  window.dispatchEvent(new Event("resize"));
  expect(await screen.findByText("from | 3", { exact: false })).toBeVisible();
  expect(await screen.findByText("to | 5", { exact: false })).toBeVisible();
});

test("Given the Desired states view When promoting a version, then the correct request is be fired", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  userEvent.click(
    within(rows[8]).getByRole("button", {
      name: "Actions",
    })
  );

  expect(
    within(screen.getByRole("menu", { name: "Actions" })).getByText("Promote")
  ).toHaveAttribute("aria-disabled", "true");

  userEvent.click(
    within(rows[0]).getByRole("button", {
      name: "Actions",
    })
  );

  userEvent.click(
    within(screen.getByRole("menu", { name: "Actions" })).getByText("Promote")
  );

  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/desiredstate/9/promote",
    body: null,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.resolvedRequests).toHaveLength(3);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(4);
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("Given the Desired states view with filters When promoting a version, then the correct request is be fired", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Status" }));

  const input = screen.getByPlaceholderText("Select status...");
  userEvent.click(input);

  const option = await screen.findByRole("option", {
    name: "candidate",
  });
  userEvent.click(option);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  userEvent.click(
    within(rows[0]).getByRole("button", {
      name: "Actions",
    })
  );

  userEvent.click(
    within(screen.getByRole("menu", { name: "Actions" })).getByText("Promote")
  );

  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/desiredstate/9/promote",
    body: null,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.none());
  });
  expect(apiHelper.resolvedRequests).toHaveLength(4);
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    environment: "env",
    url: "/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=candidate",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });
  expect(apiHelper.resolvedRequests).toHaveLength(5);
  expect(apiHelper.pendingRequests).toHaveLength(0);
});

test("Given the Desired states view When promoting a version results in an error, then the error is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(204);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });
  const rows = await screen.findAllByRole("row", {
    name: "DesiredStates Table Row",
  });

  userEvent.click(
    within(rows[0]).getByRole("button", {
      name: "Actions",
    })
  );

  userEvent.click(
    within(screen.getByRole("menu", { name: "Actions" })).getByText("Promote")
  );

  expect(apiHelper.pendingRequests).toHaveLength(1);
  const request = apiHelper.pendingRequests[0];
  expect(request).toEqual({
    method: "POST",
    environment: "env",
    url: "/api/v2/desiredstate/9/promote",
    body: null,
  });
  await act(async () => {
    await apiHelper.resolve(Maybe.some("something happened"));
    await apiHelper.resolve(Either.right(DesiredStateVersions.response));
  });
  expect(await screen.findByText("something happened")).toBeVisible();
});

test("DesiredStatesView shows CompileWidget", async () => {
  const { component } = setup();
  render(component);
  expect(screen.getByRole("generic", { name: "CompileWidget" })).toBeVisible();
});
