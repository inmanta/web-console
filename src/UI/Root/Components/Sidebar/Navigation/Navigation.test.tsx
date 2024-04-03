import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { RemoteData, ServerStatus } from "@/Core";
import {
  PrimaryFeatureManager,
  getStoreInstance,
  GetServerStatusStateHelper,
  QueryResolverImpl,
  QueryManagerResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  ServerStatus as TestServerStatus,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Navigation } from "./Navigation";

function setup(
  initialEntries: string[] | undefined,
  serverStatus: ServerStatus,
) {
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  store.dispatch.serverStatus.setData(RemoteData.success(serverStatus));
  const featureManager = new PrimaryFeatureManager(
    GetServerStatusStateHelper(store),
  );
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );
  const component = (
    <MemoryRouter initialEntries={initialEntries}>
      <DependencyProvider
        dependencies={{ ...dependencies, featureManager, queryResolver }}
      >
        <StoreProvider store={store}>
          <Navigation environment="env" />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper };
}

test("GIVEN Navigation WHEN lsm enabled THEN shows all navigation items", () => {
  const { component } = setup(undefined, TestServerStatus.withLsm);
  render(component);

  const navigation = screen.getByRole("navigation", { name: "Global" });
  expect(navigation).toBeVisible();
  expect(within(navigation).getAllByRole("region").length).toEqual(4);
  expect(
    within(navigation).getByRole("region", {
      name: words("navigation.environment"),
    }),
  ).toBeVisible();

  expect(
    within(navigation).getByRole("region", {
      name: words("navigation.lifecycleServiceManager"),
    }),
  ).toBeVisible();

  expect(
    within(navigation).getByRole("region", {
      name: words("navigation.orchestrationEngine"),
    }),
  ).toBeVisible();

  expect(
    within(navigation).getByRole("region", {
      name: words("navigation.resourceManager"),
    }),
  ).toBeVisible();
});

test("GIVEN Navigation WHEN no features enabled THEN no extra features are not shown", () => {
  const { component } = setup(undefined, TestServerStatus.withoutFeatures);
  render(component);

  const navigation = screen.getByRole("navigation", { name: "Global" });
  expect(navigation).toBeVisible();
  expect(within(navigation).getAllByRole("region").length).toEqual(3);

  // no lsm
  expect(
    within(navigation).queryByRole("region", {
      name: words("navigation.lifecycleServiceManager"),
    }),
  ).not.toBeInTheDocument();

  // no orderView
  expect(
    within(navigation).queryByRole("link", { name: "Orders" }),
  ).not.toBeInTheDocument();

  // no resourceDiscovery
  expect(
    within(navigation).queryByRole("link", { name: "Discovered Resources" }),
  ).not.toBeInTheDocument();
});

test("GIVEN Navigation WHEN all features are enabled THEN all extra features are shown", () => {
  const { component } = setup(undefined, TestServerStatus.withAllFeatures);
  render(component);

  const navigation = screen.getByRole("navigation", { name: "Global" });
  expect(navigation).toBeVisible();
  expect(within(navigation).getAllByRole("region").length).toEqual(4);

  // lsm
  expect(
    within(navigation).getByRole("region", {
      name: words("navigation.lifecycleServiceManager"),
    }),
  ).toBeInTheDocument();

  // has orderView
  expect(
    within(navigation).getByRole("link", { name: "Orders" }),
  ).toBeInTheDocument();

  // has resourceDiscovery
  expect(
    within(navigation).getByRole("link", { name: "Discovered Resources" }),
  ).toBeInTheDocument();
});

test("GIVEN Navigation WHEN on 'Service Catalog' THEN 'Service Catalog' is highlighted", () => {
  const { component } = setup(["/lsm/catalog"], TestServerStatus.withLsm);
  render(component);

  const navigation = screen.getByRole("navigation", { name: "Global" });
  const link = within(navigation).getByRole("link", {
    name: "Service Catalog",
  });
  expect(link).toHaveClass("pf-v5-m-current");
});

test("GIVEN Navigation WHEN Compilation Reports are pending THEN 'Compile Reports' Indication is visible", async () => {
  const { component, apiHelper } = setup(
    ["/lsm/catalog"],
    TestServerStatus.withLsm,
  );
  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "HEAD",
    url: "/api/v1/notify/env",
  });

  await act(async () => {
    await apiHelper.resolve(200);
  });

  const Indication = screen.getByLabelText("CompileReportsIndication");

  expect(Indication).toBeVisible();
});
