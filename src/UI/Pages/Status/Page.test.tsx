import React from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import {
  GetServerStatusContinuousQueryManager,
  GetServerStatusStateHelper,
  getStoreInstance,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  ServerStatus,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "./Page";

test("GIVEN StatusPage THEN shows server status", async () => {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  store.dispatch.serverStatus.setData(RemoteData.success(ServerStatus.withLsm));
  const getServerStatusQueryManager = new GetServerStatusContinuousQueryManager(
    apiHelper,
    new GetServerStatusStateHelper(store),
    new StaticScheduler()
  );
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([getServerStatusQueryManager])
  );

  render(
    <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
      <StoreProvider store={store}>
        <Page />
      </StoreProvider>
    </DependencyProvider>
  );

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/api/v1/serverstatus`,
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ServerStatus.withLsm }));
  });

  expect(screen.getByRole("list", { name: "StatusList" })).toBeVisible();
  expect(
    screen.getByRole("listitem", {
      name: "StatusItem-Inmanta Service Orchestrator",
    })
  ).toBeVisible();
  expect(
    screen.getByRole("listitem", {
      name: "StatusItem-lsm",
    })
  ).toBeVisible();
  expect(
    screen.getByRole("listitem", {
      name: "StatusItem-lsm.database",
    })
  ).toBeVisible();
});
