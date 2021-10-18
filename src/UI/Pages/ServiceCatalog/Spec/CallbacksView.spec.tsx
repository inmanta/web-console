import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { MemoryRouter } from "react-router";
import {
  DeferredFetcher,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Service,
  Callback,
  DeferredApiHelper,
} from "@/Test";
import { CallbacksView } from "@/UI/Pages/ServiceCatalog/Tabs/Callbacks";
import { Either, Maybe } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  CommandResolverImpl,
  getStoreInstance,
  CallbacksStateHelper,
  CallbacksQueryManager,
  CreateCallbackCommandManager,
  DeleteCallbackCommandManager,
  CallbacksUpdater,
} from "@/Data";

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
  const callbacksUpdater = new CallbacksUpdater(
    new CallbacksStateHelper(store, environment),
    callbacksFetcher,
    environment
  );
  const deleteCallbackCommandManager = new DeleteCallbackCommandManager(
    apiHelper,
    callbacksUpdater,
    environment
  );

  const createCallbackCommandManager = new CreateCallbackCommandManager(
    apiHelper,
    callbacksUpdater,
    environment
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      deleteCallbackCommandManager,
      createCallbackCommandManager,
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ queryResolver, commandResolver }}>
        <StoreProvider store={store}>
          <CallbacksView service_entity={Service.a.name} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
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
  const { component, callbacksFetcher, apiHelper } = setup();
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

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0].url).toMatch("/lsm/v1/callbacks");

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: "callbackId" }));
  });

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
