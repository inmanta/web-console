import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  DeployCommandManager,
  RepairCommandManager,
} from "@/Data";
import {
  GetDesiredStatesQueryManager,
  GetDesiredStatesStateHelper,
} from "@/Data/Managers/GetDesiredStates";
import {
  DynamicQueryManagerResolver,
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DesiredStateVersions,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const environment = "env";
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetDesiredStatesQueryManager(
        apiHelper,
        new GetDesiredStatesStateHelper(store, environment),
        scheduler
      ),
    ])
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new DeployCommandManager(apiHelper, environment),
      new RepairCommandManager(apiHelper, environment),
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

it("When using the Date filter then the desired state versions within the range selected range should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

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

  const fromDatePicker = await screen.findByLabelText("From Date Picker");
  userEvent.click(fromDatePicker);
  userEvent.type(fromDatePicker, `2021-12-06`);
  const toDatePicker = await screen.findByLabelText("To Date Picker");
  userEvent.click(toDatePicker);
  userEvent.type(toDatePicker, `2021-12-07`);

  userEvent.click(await screen.findByLabelText("Apply date filter"));

  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/api/v2/desiredstate?limit=20&sort=version.desc&filter.status=active&filter.status=candidate&filter.status=retired&filter.date=ge%3A2021-12-`
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
    await screen.findByText("from | 2021-12-06+00:00", { exact: false })
  ).toBeVisible();
  expect(
    await screen.findByText("to | 2021-12-07+00:00", { exact: false })
  ).toBeVisible();
});

it("When using the Version filter then the desired state versions within the range selected range should be fetched and shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

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
