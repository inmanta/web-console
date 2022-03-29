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
} from "@S/ServiceCatalog/Data";
import { Page } from "@S/ServiceCatalog/UI/Page";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();

  const servicesQueryManager = new ServicesQueryManager(
    apiHelper,
    new ServicesStateHelper(store),
    scheduler
  );
  const callbacksStateHelper = new CallbacksStateHelper(store);
  const callbacksQueryManager = new CallbacksQueryManager(
    apiHelper,
    callbacksStateHelper
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      servicesQueryManager,
      callbacksQueryManager,
    ])
  );

  const deleteServiceCommandManager = new DeleteServiceCommandManager(
    new BaseApiHelper()
  );

  const deleteCallbackCommandManager = new DeleteCallbackCommandManager(
    apiHelper,
    new CallbacksUpdater(new CallbacksStateHelper(store), apiHelper)
  );

  const createCallbackCommandManager = new CreateCallbackCommandManager(
    apiHelper,
    new CallbacksUpdater(new CallbacksStateHelper(store), apiHelper)
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
