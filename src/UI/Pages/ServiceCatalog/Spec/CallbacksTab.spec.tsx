import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
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
  useEnvironment,
} from "@/Data";
import {
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Service,
  StaticScheduler,
  Callback,
  DeferredApiHelper,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ServiceCatalogPage } from "@/UI/Pages";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const environment = Service.a.environment;

  const servicesQueryManager = new ServicesQueryManager(
    apiHelper,
    new ServicesStateHelper(store, environment),
    scheduler,
    useEnvironment
  );
  const callbacksStateHelper = new CallbacksStateHelper(store, environment);
  const callbacksQueryManager = new CallbacksQueryManager(
    apiHelper,
    callbacksStateHelper,
    useEnvironment
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
      <DependencyProvider
        dependencies={{ ...dependencies, queryResolver, commandResolver }}
      >
        <StoreProvider store={store}>
          <ServiceCatalogPage />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
  };
}

test("GIVEN ServiceCatalog WHEN click on callbacks tab THEN shows callbacks tab", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(Either.right({ data: [Service.a] }));

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
