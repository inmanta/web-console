import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { MemoryRouter } from "react-router";
import {
  DeferredFetcher,
  DynamicQueryManagerResolver,
  Service,
  StaticScheduler,
  ResourceLogs,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  getStoreInstance,
  ResourceLogsStateHelper,
  ResourceLogsQueryManager,
} from "@/Data";
import { View } from "./View";

function setup() {
  const store = getStoreInstance();
  const environment = Service.a.environment;

  const resourceLogsFetcher = new DeferredFetcher<"ResourceLogs">();
  const resourceLogsStateHelper = new ResourceLogsStateHelper(store);
  const resourceLogsQueryManager = new ResourceLogsQueryManager(
    resourceLogsFetcher,
    resourceLogsStateHelper,
    new StaticScheduler(),
    environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([resourceLogsQueryManager])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ queryResolver }}>
        <StoreProvider store={store}>
          <View resourceId="resourceId1" />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    resourceLogsFetcher,
  };
}

test("GIVEN ResourceLogsView THEN shows resource logs", async () => {
  const { component, resourceLogsFetcher } = setup();
  render(component);

  expect(
    screen.getByRole("generic", { name: "ResourceLogs-Loading" })
  ).toBeVisible();

  await act(async () => {
    resourceLogsFetcher.resolve(Either.right(ResourceLogs.response));
  });

  expect(
    await screen.findByRole("grid", { name: "ResourceLogsTable" })
  ).toBeVisible();

  const rows = await screen.findAllByRole("rowgroup", {
    name: "ResourceLogRow",
  });
  expect(rows).toHaveLength(3);
});

test("GIVEN ResourceLogsView WHEN filtered on message THEN only shows relevant logs", async () => {
  const { component, resourceLogsFetcher } = setup();
  render(component);

  await act(async () => {
    resourceLogsFetcher.resolve(Either.right(ResourceLogs.response));
  });

  const messageFilter = screen.getByRole("searchbox", {
    name: "MessageFilter",
  });
  userEvent.type(messageFilter, "failed{enter}");

  await act(async () => {
    resourceLogsFetcher.resolve(
      Either.right({
        ...ResourceLogs.response,
        data: [ResourceLogs.response.data[0]],
      })
    );
  });

  const row = await screen.findByRole("rowgroup", {
    name: "ResourceLogRow",
  });
  expect(row).toBeInTheDocument();
});
