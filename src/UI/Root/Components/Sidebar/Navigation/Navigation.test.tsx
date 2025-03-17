import React from "react";
import { MemoryRouter } from "react-router-dom";
import {
  QueryClientProvider,
  QueryClient,
  QueryObserverResult,
} from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { ServerStatus } from "@/Core";
import {
  PrimaryFeatureManager,
  getStoreInstance,
  QueryResolverImpl,
  QueryManagerResolverImpl,
} from "@/Data";
import * as queryModule from "@/Data/Managers/V2/Compilation/GetCompilerStatus/useGetCompilerStatus";
import {
  DeferredApiHelper,
  dependencies,
  ServerStatus as TestServerStatus,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Navigation } from "./Navigation";

expect.extend(toHaveNoViolations);

function setup(
  initialEntries: string[] | undefined,
  serverStatus: ServerStatus,
) {
  const queryClient = new QueryClient();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();

  const featureManager = PrimaryFeatureManager();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );
  const component = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <DependencyProvider
          dependencies={{ ...dependencies, featureManager, queryResolver }}
        >
          <StoreProvider store={store}>
            <Navigation environment="env" />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { component, apiHelper };
}

test("GIVEN Navigation THEN it should be accessible", async () => {
  const { component } = setup(undefined, TestServerStatus.withLsm);
  const { container } = render(component);

  expect(await axe(container)).toHaveNoViolations();
});

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

  const links = within(navigation).getAllByRole("link", {
    name: "Sidebar-Navigation-Item",
  });

  // no lsm
  expect(
    within(navigation).queryByRole("region", {
      name: words("navigation.lifecycleServiceManager"),
    }),
  ).not.toBeInTheDocument();

  // no orderView
  expect(links.find((item) => item.textContent === "Orders")).toBeUndefined();

  // no resourceDiscovery
  expect(
    links.find((item) => item.textContent === "Discovered Resources"),
  ).toBeUndefined();
});

test("GIVEN Navigation WHEN all features are enabled THEN all extra features are shown", () => {
  const { component } = setup(undefined, TestServerStatus.withAllFeatures);

  render(component);

  const navigation = screen.getByRole("navigation", { name: "Global" });

  expect(navigation).toBeVisible();
  expect(within(navigation).getAllByRole("region").length).toEqual(4);

  const links = within(navigation).getAllByRole("link", {
    name: "Sidebar-Navigation-Item",
  });

  // lsm
  expect(
    within(navigation).getByRole("region", {
      name: words("navigation.lifecycleServiceManager"),
    }),
  ).toBeInTheDocument();

  // has orderView
  expect(
    links.find((item) => item.textContent === "Orders"),
  ).toBeInTheDocument();

  // has resourceDiscovery
  expect(
    links.find((item) => item.textContent === "Discovered Resources"),
  ).toBeInTheDocument();
});

test("GIVEN Navigation WHEN on 'Service Catalog' THEN 'Service Catalog' is highlighted", () => {
  const { component } = setup(["/lsm/catalog"], TestServerStatus.withLsm);

  render(component);

  const navigation = screen.getByRole("navigation", { name: "Global" });
  const links = within(navigation).getAllByRole("link", {
    name: "Sidebar-Navigation-Item",
  });

  const link = links.find((item) => item.textContent === "Service Catalog");

  expect(link).toHaveClass("active");
});

test("GIVEN Navigation WHEN Compilation Reports are not pending THEN 'Compile Reports' Indication does not exist", async () => {
  const { component } = setup(["/lsm/catalog"], TestServerStatus.withLsm);

  render(component);
  const Indication = screen.queryByLabelText("CompileReportsIndication");

  expect(Indication).toBeNull();
});

test("GIVEN Navigation WHEN Compilation Reports are pending THEN 'Compile Reports' Indication is visible", async () => {
  jest.spyOn(queryModule, "useGetCompilerStatus").mockReturnValue({
    useContinuous: () =>
      ({
        data: {
          isCompiling: true,
        },
        isSuccess: true,
      }) as unknown as QueryObserverResult<{ isCompiling: boolean }, Error>,
  });
  const { component } = setup(["/lsm/catalog"], TestServerStatus.withLsm);

  render(component);
  const Indication = screen.getByLabelText("CompileReportsIndication");

  expect(Indication).toBeVisible();
});
