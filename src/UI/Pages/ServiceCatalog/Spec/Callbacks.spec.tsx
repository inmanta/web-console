import React from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  InstantPoster,
  Service,
  StaticScheduler,
  Callback,
} from "@/Test";
import { ServiceCatalog } from "@/UI/Pages";
import { Either, RemoteData } from "@/Core";
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
  CallbackDeleter,
  CallbacksUpdater,
  DeleteServiceCommandManager,
  ServiceDeleter,
} from "@/Data";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const baseApiHelper = new BaseApiHelper();
  const environment = Service.a.environment;
  const servicesFetcher = new DeferredFetcher<"Services">();

  const servicesQueryManager = new ServicesQueryManager(
    servicesFetcher,
    new ServicesStateHelper(store, environment),
    scheduler,
    environment
  );
  const callbacksFetcher = new DeferredFetcher<"Callbacks">();
  const callbacksStateHelper = new CallbacksStateHelper(store, environment);
  const callbacksQueryManager = new CallbacksQueryManager(
    callbacksFetcher,
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
    new ServiceDeleter(new BaseApiHelper(), Service.a.environment)
  );

  const deleteCallbackCommandManager = new DeleteCallbackCommandManager(
    new CallbackDeleter(baseApiHelper, environment),
    new CallbacksUpdater(
      new CallbacksStateHelper(store, environment),
      new DeferredFetcher<"Callbacks">(),
      environment
    )
  );

  const createCallbackCommandManager = new CreateCallbackCommandManager(
    new InstantPoster<"CreateCallback">(
      RemoteData.success({ data: Callback.a.callback_id })
    ),
    new CallbacksUpdater(
      new CallbacksStateHelper(store, environment),
      new DeferredFetcher<"Callbacks">(),
      environment
    )
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
          <ServiceCatalog />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    servicesFetcher,
    callbacksFetcher,
  };
}

test("GIVEN ServiceCatalog WHEN click on callbacks tab THEN shows callbacks tab", async () => {
  const { component, servicesFetcher, callbacksFetcher } = setup();
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
    callbacksFetcher.resolve(Either.right({ data: Callback.list }));
  });

  expect(
    await screen.findByRole("grid", { name: "CallbacksTable" })
  ).toBeVisible();
});
