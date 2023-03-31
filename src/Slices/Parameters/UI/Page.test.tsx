import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
  CommandResolverImpl,
} from "@/Data";
import { UpdateInstanceAttributeCommandManager } from "@/Data/Managers/UpdateInstanceAttribute";
import {
  DynamicQueryManagerResolver,
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
} from "@/Test";
import { words } from "@/UI";
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
      GetParametersQueryManager(
        apiHelper,
        GetParametersStateHelper(store),
        scheduler
      ),
    ])
  );
  const updateAttribute = UpdateInstanceAttributeCommandManager(
    new KeycloakAuthHelper(),
    apiHelper
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([updateAttribute])
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
    words("parameters.filters.name.placeholder")
  );

  await act(async () => {
    await userEvent.click(input);
  });
  await act(async () => {
    await userEvent.type(input, "param{enter}");
  });

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
      screen.getByRole("option", { name: words("parameters.columns.source") })
    );
  });

  const input = screen.getByPlaceholderText(
    words("parameters.filters.source.placeholder")
  );

  await act(async () => {
    await userEvent.click(input);
  });
  await act(async () => {
    await userEvent.type(input, "plugin{enter}");
  });

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
        name: words("parameters.columns.updated.tests"),
      })
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
  await act(async () => {
    window.dispatchEvent(new Event("resize"));
  });

  expect(
    await screen.findByText("from | 2022/01/31 00:00:00", { exact: false })
  ).toBeVisible();
  expect(
    await screen.findByText("to | 2022/02/01 00:00:00", { exact: false })
  ).toBeVisible();
});
