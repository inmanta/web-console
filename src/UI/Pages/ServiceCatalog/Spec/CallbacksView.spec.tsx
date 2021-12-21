import React from "react";
import { MemoryRouter } from "react-router";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, Maybe } from "@/Core";
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
import {
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Service,
  Callback,
  DeferredApiHelper,
  dependencies,
  MockEnvironmentHandler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { CallbacksView } from "@/UI/Pages/ServiceCatalog/Tabs/Callbacks";

function setup() {
  const store = getStoreInstance();
  const environment = Service.a.environment;
  const apiHelper = new DeferredApiHelper();
  const callbacksStateHelper = new CallbacksStateHelper(store);
  const callbacksQueryManager = new CallbacksQueryManager(
    apiHelper,
    callbacksStateHelper
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([callbacksQueryManager])
  );

  const callbacksUpdater = new CallbacksUpdater(
    new CallbacksStateHelper(store),
    apiHelper
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
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentHandler: new MockEnvironmentHandler(environment),
        }}
      >
        <StoreProvider store={store}>
          <CallbacksView service_entity={Service.a.name} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
    store,
  };
}

test("GIVEN CallbacksTab WHEN user click on delete and confirms THEN callback is deleted", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    apiHelper.resolve(Either.right({ data: Callback.list }));
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
    apiHelper.resolve(Either.right({ data: rest }));
  });

  expect(
    screen.queryByRole("row", { name: "CallbackRow-79e7" })
  ).not.toBeInTheDocument();
});

test("GIVEN CallbacksTab WHEN user fills in form and clicks on Add THEN callback is created", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    apiHelper.resolve(Either.right({ data: Callback.list }));
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
    await apiHelper.resolve(
      Either.right({
        data: [...Callback.list, { ...Callback.a, callback_id: "1234" }],
      })
    );
  });

  expect(
    await screen.findByRole("row", { name: "CallbackRow-1234" })
  ).toBeVisible();
});
