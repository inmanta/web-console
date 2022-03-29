import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import { QueryResolverImpl, getStoreInstance } from "@/Data";
import {
  DynamicQueryManagerResolver,
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  GetParametersQueryManager,
  GetParametersStateHelper,
} from "@S/Parameters/Data";
import * as Parameters from "@S/Parameters/Data/Mock";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetParametersQueryManager(
        apiHelper,
        new GetParametersStateHelper(store),
        scheduler
      ),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
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

  const input = screen.getByPlaceholderText("Filter by name");

  userEvent.click(input);
  userEvent.type(input, "param{enter}");

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/parameters?limit=20&sort=name.asc&filter.name=param`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Parameters.response,
        data: Parameters.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Parameters Table Row",
  });
  expect(rowsAfter).toHaveLength(3);
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

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Source" }));

  const input = screen.getByPlaceholderText("Filter by source");

  userEvent.click(input);
  userEvent.type(input, "plugin{enter}");

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/parameters?limit=20&sort=name.asc&filter.source=plugin`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Parameters.response,
        data: Parameters.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Parameters Table Row",
  });
  expect(rowsAfter).toHaveLength(3);
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

  userEvent.click(
    within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
      "button",
      { name: "FilterPicker" }
    )
  );
  userEvent.click(screen.getByRole("option", { name: "Updated" }));

  const fromDatePicker = screen.getByLabelText("From Date Picker");
  userEvent.click(fromDatePicker);
  userEvent.type(fromDatePicker, `2022/01/31`);
  const toDatePicker = screen.getByLabelText("To Date Picker");
  userEvent.click(toDatePicker);
  userEvent.type(toDatePicker, `2022-02-01`);

  userEvent.click(screen.getByLabelText("Apply date filter"));

  expect(apiHelper.pendingRequests[0].url).toMatch(
    `/api/v2/parameters?limit=20&sort=name.asc&filter.updated=ge%3A2022-01-30%2B23%3A00%3A00&filter.updated=le%3A2022-01-31%2B23%3A00%3A00`
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Parameters.response,
        data: Parameters.response.data.slice(0, 3),
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "Parameters Table Row",
  });
  expect(rowsAfter).toHaveLength(3);

  // The chips are hidden in small windows, so resize it
  window = Object.assign(window, { innerWidth: 1200 });
  window.dispatchEvent(new Event("resize"));
  expect(
    await screen.findByText("from | 2022/01/31 00:00:00", { exact: false })
  ).toBeVisible();
  expect(
    await screen.findByText("to | 2022/02/01 00:00:00", { exact: false })
  ).toBeVisible();
});
