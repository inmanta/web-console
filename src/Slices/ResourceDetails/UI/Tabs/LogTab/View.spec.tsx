import React from "react";
import { MemoryRouter } from "react-router";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import { QueryResolverImpl, getStoreInstance } from "@/Data";
import {
  Resource,
  DynamicQueryManagerResolver,
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  ResourceLogsQueryManager,
  ResourceLogsStateHelper,
} from "@S/ResourceDetails/Data";
import { ResourceLogs } from "@S/ResourceDetails/Data/Mock";
import { View } from "./View";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const resourceLogsStateHelper = ResourceLogsStateHelper(store);
  const resourceLogsQueryManager = ResourceLogsQueryManager(
    apiHelper,
    resourceLogsStateHelper,
    new StaticScheduler(),
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([resourceLogsQueryManager]),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <View resourceId={Resource.id} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
  };
}

test("GIVEN ResourceLogsView THEN shows resource logs", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    screen.getByRole("generic", { name: "ResourceLogs-Loading" }),
  ).toBeVisible();

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    environment: "env",
    url: `/api/v2/resource/${Resource.encodedId}/logs?limit=20&sort=timestamp.desc`,
    method: "GET",
  });

  await act(async () => {
    apiHelper.resolve(Either.right(ResourceLogs.response));
  });

  expect(
    await screen.findByRole("grid", { name: "ResourceLogsTable" }),
  ).toBeVisible();

  const rows = await screen.findAllByRole("rowgroup", {
    name: "ResourceLogRow",
  });
  expect(rows).toHaveLength(3);
});

test("GIVEN ResourceLogsView WHEN filtered on message THEN only shows relevant logs", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    apiHelper.resolve(Either.right(ResourceLogs.response));
  });

  const messageFilter = screen.getByRole("searchbox", {
    name: "MessageFilter",
  });
  await act(async () => {
    await userEvent.type(messageFilter, "failed{enter}");
  });

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        ...ResourceLogs.response,
        data: [ResourceLogs.response.data[0]],
      }),
    );
  });

  const row = await screen.findByRole("rowgroup", {
    name: "ResourceLogRow",
  });
  expect(row).toBeInTheDocument();
});
