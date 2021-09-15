import React from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  InstantPoster,
  Service,
  Callback,
  DeferredApiHelper,
  flushPromises,
} from "@/Test";
import { CallbacksView } from "@/UI/Pages/ServiceCatalog/Tabs/Callbacks";
import { Either, Maybe, RemoteData } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  CommandResolverImpl,
  getStoreInstance,
  CallbacksStateHelper,
  CallbacksQueryManager,
  CreateCallbackCommandManager,
  DeleteCallbackCommandManager,
  CallbackDeleter,
  CallbacksUpdater,
} from "@/Data";
import userEvent from "@testing-library/user-event";

function setup() {
  const store = getStoreInstance();
  const environment = Service.a.environment;

  const callbacksFetcher = new DeferredFetcher<"Callbacks">();
  const callbacksStateHelper = new CallbacksStateHelper(store, environment);
  const callbacksQueryManager = new CallbacksQueryManager(
    callbacksFetcher,
    callbacksStateHelper,
    environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([callbacksQueryManager])
  );

  const apiHelper = new DeferredApiHelper();
  const callbackDeleter = new CallbackDeleter(apiHelper, environment);
  const callbacksUpdater = new CallbacksUpdater(
    new CallbacksStateHelper(store, environment),
    callbacksFetcher,
    environment
  );
  const deleteCallbackCommandManager = new DeleteCallbackCommandManager(
    callbackDeleter,
    callbacksUpdater
  );

  const createCallbackCommandManager = new CreateCallbackCommandManager(
    new InstantPoster<"CreateCallback">(
      RemoteData.success({ data: Callback.a.callback_id })
    ),
    callbacksUpdater
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      deleteCallbackCommandManager,
      createCallbackCommandManager,
    ])
  );

  const component = (
    <DependencyProvider dependencies={{ queryResolver, commandResolver }}>
      <StoreProvider store={store}>
        <CallbacksView service_entity={Service.a.name} />
      </StoreProvider>
    </DependencyProvider>
  );

  return {
    component,
    callbacksFetcher,
    apiHelper,
  };
}

test("GIVEN CallbacksTab WHEN user click on delete and confirms THEN callback is deleted", async () => {
  const { component, callbacksFetcher, apiHelper } = setup();
  render(component);

  await act(async () => {
    callbacksFetcher.resolve(Either.right({ data: Callback.list }));
  });

  expect(
    await screen.findByRole("grid", { name: "CallbacksTable" })
  ).toBeVisible();

  expect(screen.getByRole("row", { name: "CallbackRow-79e7" })).toBeVisible();

  const deleteButton = await screen.findByRole("button", {
    name: "DeleteCallback-79e7",
  });
  userEvent.click(deleteButton);

  expect(screen.getByRole("dialog", { name: "Delete Callback" })).toBeVisible();

  const yesButton = screen.getByRole("button", { name: "Yes" });
  userEvent.click(yesButton);

  await act(async () => {
    apiHelper.resolve(Maybe.none());
  });

  const [, ...rest] = Callback.list;

  await act(async () => {
    callbacksFetcher.resolve(Either.right({ data: rest }));
  });

  expect(
    screen.queryByRole("row", { name: "CallbackRow-79e7" })
  ).not.toBeInTheDocument();
});

test("GIVEN CallbacksTab WHEN user fills in form and clicks on Add THEN callback is created", async () => {
  const { component, callbacksFetcher } = setup();
  render(component);

  await act(async () => {
    callbacksFetcher.resolve(Either.right({ data: Callback.list }));
  });

  expect(
    await screen.findByRole("grid", { name: "CallbacksTable" })
  ).toBeVisible();

  expect(screen.getByRole("row", { name: "CallbackRow-79e7" })).toBeVisible();

  const callbackUrlInput = screen.getByRole("textbox", {
    name: "callbackUrl",
  });
  userEvent.type(callbackUrlInput, "http://www.example.com/");
  const minimalLogLevelInput = screen.getByRole("button", {
    name: "MinimalLogLevel",
  });
  userEvent.click(minimalLogLevelInput);
  const criticalOption = screen.getByRole("option", { name: "CRITICAL" });
  userEvent.click(criticalOption);

  const eventTypesInput = screen.getByRole("button", {
    name: "EventTypes",
  });
  userEvent.click(eventTypesInput);
  const checkbox = screen.getByRole("checkbox", {
    name: "ALLOCATION_UPDATE",
  });
  userEvent.click(checkbox);

  const addButton = screen.getByRole("button", {
    name: "Add",
  });
  userEvent.click(addButton);

  await flushPromises();

  await act(async () => {
    await callbacksFetcher.resolve(
      Either.right({
        data: [...Callback.list, { ...Callback.a, callback_id: "1234" }],
      })
    );
  });

  expect(
    await screen.findByRole("row", { name: "CallbackRow-1234" })
  ).toBeVisible();
});
