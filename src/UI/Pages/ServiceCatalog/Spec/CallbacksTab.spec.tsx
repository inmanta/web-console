import React from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Service,
  StaticScheduler,
  Callback,
  DeferredApiHelper,
} from "@/Test";
import { ServiceCatalogPage } from "@/UI/Pages";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  ServicesQueryManager,
  ServicesStateHelper,
  CommandResolverImpl,
  getStoreInstance,
  BaseApiHelper,
  CallbacksStateHelper,
  CallbacksQueryManager,
  CreateCallbackCommandManager,
  DeleteCallbackCommandManager,
  CallbacksUpdater,
  DeleteServiceCommandManager,
} from "@/Data";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const environment = Service.a.environment;
  const servicesFetcher = new DeferredFetcher<"GetServices">();

  const servicesQueryManager = new ServicesQueryManager(
    servicesFetcher,
    new ServicesStateHelper(store, environment),
    scheduler,
    environment
  );
  const callbacksStateHelper = new CallbacksStateHelper(store, environment);
  const callbacksQueryManager = new CallbacksQueryManager(
    apiHelper,
    callbacksStateHelper,
    environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      servicesQueryManager,
      callbacksQueryManager,
    ])
  );

  const deleteServiceCommandManager = new DeleteServiceCommandManager(
    new BaseApiHelper(),
    Service.a.environment
  );

  const deleteCallbackCommandManager = new DeleteCallbackCommandManager(
    apiHelper,
    new CallbacksUpdater(
      new CallbacksStateHelper(store, environment),
      apiHelper,
      environment
    ),
    environment
  );

  const createCallbackCommandManager = new CreateCallbackCommandManager(
    apiHelper,
    new CallbacksUpdater(
      new CallbacksStateHelper(store, environment),
      apiHelper,
      environment
    ),
    environment
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      deleteServiceCommandManager,
      deleteCallbackCommandManager,
      createCallbackCommandManager,
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ queryResolver, commandResolver }}>
        <StoreProvider store={store}>
          <ServiceCatalogPage />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    servicesFetcher,
    apiHelper,
  };
}

test("GIVEN ServiceCatalog WHEN click on callbacks tab THEN shows callbacks tab", async () => {
  const { component, servicesFetcher, apiHelper } = setup();
  render(component);

  servicesFetcher.resolve(Either.right({ data: [Service.a] }));

  const details = await screen.findByRole("button", {
    name: `${Service.a.name} Details`,
  });
  userEvent.click(details);

  const callbacksButton = screen.getByRole("button", { name: "Callbacks" });
  userEvent.click(callbacksButton);

  expect(
    screen.getByRole("generic", { name: "Callbacks-Loading" })
  ).toBeVisible();

  await act(async () => {
    apiHelper.resolve(Either.right({ data: Callback.list }));
  });

  expect(
    await screen.findByRole("grid", { name: "CallbacksTable" })
  ).toBeVisible();

  expect(screen.getByRole("row", { name: "CallbackRow-79e7" })).toBeVisible();
});
