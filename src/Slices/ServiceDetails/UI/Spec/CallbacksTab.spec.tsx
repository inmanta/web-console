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
  DeleteServiceCommandManager,
  ServiceQueryManager,
  ServiceKeyMaker,
  ServiceStateHelper,
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
import {
  CallbacksQueryManager,
  CallbacksStateHelper,
  CallbacksUpdater,
  CreateCallbackCommandManager,
  DeleteCallbackCommandManager,
} from "@S/ServiceDetails/Data";
import { Page } from "@S/ServiceDetails/UI/Page";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const serviceKeyMaker = new ServiceKeyMaker();

  const serviceQueryManager = ServiceQueryManager(
    apiHelper,
    ServiceStateHelper(store, serviceKeyMaker),
    scheduler,
    serviceKeyMaker
  );

  const servicesQueryManager = ServicesQueryManager(
    apiHelper,
    ServicesStateHelper(store),
    scheduler
  );
  const callbacksStateHelper = CallbacksStateHelper(store);
  const callbacksQueryManager = CallbacksQueryManager(
    apiHelper,
    callbacksStateHelper
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      serviceQueryManager,
      servicesQueryManager,
      callbacksQueryManager,
    ])
  );

  const deleteServiceCommandManager = DeleteServiceCommandManager(
    new BaseApiHelper()
  );

  const deleteCallbackCommandManager = DeleteCallbackCommandManager(
    apiHelper,
    new CallbacksUpdater(CallbacksStateHelper(store), apiHelper)
  );

  const createCallbackCommandManager = CreateCallbackCommandManager(
    apiHelper,
    new CallbacksUpdater(CallbacksStateHelper(store), apiHelper)
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
          <Page />
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

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: [Service.a] }));
  });

  const callbacksButton = screen.getByRole("tab", { name: "Callbacks" });
  await userEvent.click(callbacksButton);

  expect(
    screen.getByRole("generic", { name: "Callbacks-Loading" })
  ).toBeVisible();

  await act(async () => {
    apiHelper.resolve(Either.right({ data: Callback.list }));
  });

  expect(
    await screen.findByRole("grid", { name: "CallbacksTable" })
  ).toBeVisible();
  //expect(screen.getByRole("row", { name: "CallbackRow-79e7" })).toBeVisible();
});
