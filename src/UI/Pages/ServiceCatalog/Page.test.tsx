import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  ServicesQueryManager,
  ServicesStateHelper,
  getStoreInstance,
  DeleteServiceCommandManager,
  BaseApiHelper,
  CommandResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Service,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();

  const servicesHelper = new ServicesQueryManager(
    apiHelper,
    new ServicesStateHelper(store, Service.a.environment),
    scheduler,
    Service.a.environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([servicesHelper])
  );
  const commandManager = new DeleteServiceCommandManager(
    new BaseApiHelper(),
    Service.a.environment
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([commandManager])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{ ...dependencies, queryResolver, commandResolver }}
      >
        <StoreProvider store={store}>
          <Page />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
    scheduler,
  };
}

test("ServiceCatalog shows updated services", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: [] }));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Empty" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(Either.right({ data: [Service.a] }));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Success" })
  ).toBeInTheDocument();
});

test("ServiceCatalog shows updated empty", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: [Service.a] }));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Success" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(Either.right({ data: [] }));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Empty" })
  ).toBeInTheDocument();
});

test("ServiceCatalog removes service after deletion", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: [Service.a] }));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Success" })
  ).toBeInTheDocument();

  fireEvent.click(
    screen.getByRole("button", { name: `${Service.a.name} Details` })
  );

  fireEvent.click(screen.getByRole("button", { name: "Delete" }));

  fireEvent.click(screen.getByRole("button", { name: "Yes" }));

  scheduler.executeAll();

  apiHelper.resolve(Either.right({ data: [] }));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Empty" })
  ).toBeInTheDocument();
});
