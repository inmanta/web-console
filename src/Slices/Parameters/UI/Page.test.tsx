import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  defaultAuthContext,
} from "@/Data";
import { UpdateInstanceAttributeCommandManager } from "@/Data/Managers/UpdateInstanceAttribute";
import {
  DynamicQueryManagerResolverImpl,
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolverImpl,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import {
  GetParametersQueryManager,
  GetParametersStateHelper,
} from "@S/Parameters/Data";
import * as Parameters from "@S/Parameters/Data/Mock";
import { ParametersPage } from ".";

expect.extend(toHaveNoViolations);

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      GetParametersQueryManager(
        apiHelper,
        GetParametersStateHelper(store),
        scheduler,
      ),
    ]),
  );
  const updateAttribute = UpdateInstanceAttributeCommandManager(
    defaultAuthContext,
    apiHelper,
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolverImpl([updateAttribute]),
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
          <Page>
            <ParametersPage />
          </Page>
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("When using the name filter then only the matching parameters should be fetched and shown", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Parameters.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Parameters Table Row",
  });

  expect(initialRows).toHaveLength(10);

  const input = screen.getByPlaceholderText(
    words("parameters.filters.name.placeholder"),
  );

  await act(async () => {
    await userEvent.click(input);
  });
  await act(async () => {
    await userEvent.type(input, "param{enter}");
  });

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/parameters?limit=20&sort=name.asc&filter.name=param`,
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Parameters.response,
        data: Parameters.response.data.slice(0, 3),
      }),
    );
  });

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
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Parameters.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Parameters Table Row",
  });

  expect(initialRows).toHaveLength(10);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" },
      ),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", { name: words("parameters.columns.source") }),
    );
  });

  const input = screen.getByPlaceholderText(
    words("parameters.filters.source.placeholder"),
  );

  await act(async () => {
    await userEvent.click(input);
  });
  await act(async () => {
    await userEvent.type(input, "plugin{enter}");
  });

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/parameters?limit=20&sort=name.asc&filter.source=plugin`,
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Parameters.response,
        data: Parameters.response.data.slice(0, 3),
      }),
    );
  });

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
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Parameters.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Parameters Table Row",
  });

  expect(initialRows).toHaveLength(10);

  await act(async () => {
    await userEvent.click(
      within(screen.getByRole("toolbar", { name: "FilterBar" })).getByRole(
        "button",
        { name: "FilterPicker" },
      ),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", {
        name: words("parameters.columns.updated.tests"),
      }),
    );
  });

  const fromDatePicker = screen.getByLabelText("From Date Picker");

  await act(async () => {
    await userEvent.click(fromDatePicker);
  });
  await act(async () => {
    await userEvent.type(fromDatePicker, `2022/01/31`);
  });

  const toDatePicker = screen.getByLabelText("To Date Picker");

  await act(async () => {
    await userEvent.click(toDatePicker);
  });
  await act(async () => {
    await userEvent.type(toDatePicker, `2022-02-01`);
  });
  await act(async () => {
    await userEvent.click(screen.getByLabelText("Apply date filter"));
  });

  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/api/v2/parameters?limit=20&sort=name.asc&filter.updated=ge%3A2022-01-30%2B23%3A00%3A00&filter.updated=le%3A2022-01-31%2B23%3A00%3A00`,
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Parameters.response,
        data: Parameters.response.data.slice(0, 3),
      }),
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Parameters Table Row",
  });

  expect(rowsAfter).toHaveLength(3);

  // The chips are hidden in small windows, so resize it
  window = Object.assign(window, { innerWidth: 1200 });
  await act(async () => {
    window.dispatchEvent(new Event("resize"));
  });

  expect(
    await screen.findByText("from | 2022/01/31 00:00:00", { exact: false }),
  ).toBeVisible();
  expect(
    await screen.findByText("to | 2022/02/01 00:00:00", { exact: false }),
  ).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN ParametersView WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
  const { component, apiHelper } = setup();

  render(component);

  //mock that response has more than one site
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...Parameters.response,
        links: {
          ...Parameters.response.links,
          next: "/fake-link?end=fake-first-param",
        },
        metadata: {
          total: 103,
          before: 0,
          after: 3,
          page_size: 100,
        },
      }),
    );
  });

  expect(screen.getByLabelText("Go to next page")).toBeEnabled();

  await act(async () => {
    await userEvent.click(screen.getByLabelText("Go to next page"));
  });

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&sort=name.asc)/);

  await act(async () => {
    apiHelper.resolve(Either.right(Parameters.response));
  });

  //sort on the second page
  const resourceIdButton = await screen.findByRole("button", {
    name: "Name",
  });

  expect(resourceIdButton).toBeVisible();

  await act(async () => {
    await userEvent.click(resourceIdButton);
  });

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
  // we are asserting on the second request as the first request is for the updated sorting event, and second is chained to back to the first page with still correct sorting
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(/(&sort=name.desc)/);
});

test("GIVEN ParametersView WHEN filtering changes AND we are not on the first page THEN we are sent back to the first page", async () => {
  const { component, apiHelper } = setup();

  render(component);

  //mock that response has more than one site
  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...Parameters.response,
        links: {
          ...Parameters.response.links,
          next: "/fake-link?end=fake-first-param",
        },
        metadata: {
          total: 103,
          before: 0,
          after: 3,
          page_size: 100,
        },
      }),
    );
  });

  expect(screen.getByLabelText("Go to next page")).toBeEnabled();

  await act(async () => {
    await userEvent.click(screen.getByLabelText("Go to next page"));
  });

  //expect the api url to contain start and end keywords that are used for pagination when we are moving to the next page
  expect(apiHelper.pendingRequests[0].url).toMatch(/(&start=|&end=)/);

  await act(async () => {
    apiHelper.resolve(Either.right(Parameters.response));
  });

  //filter on the second page
  await act(async () => {
    await userEvent.type(screen.getByTestId("NameFilterInput"), "test_name");
  });
  await act(async () => {
    await userEvent.click(screen.getByLabelText("submit search"));
  });

  // expect the api url to not contain start and end keywords that are used for pagination to assert we are back on the first page.
  // we are asserting on the second request as the first request is for the updated filtering event, and second is chained to back to the first page with still correct filtering
  expect(apiHelper.pendingRequests[1].url).not.toMatch(/(&start=|&end=)/);
  expect(apiHelper.pendingRequests[1].url).toMatch(/(&filter.name=test_name)/);
});
