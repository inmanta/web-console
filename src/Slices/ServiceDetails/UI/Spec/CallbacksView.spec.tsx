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
} from "@/Data";
import {
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Service,
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
import { CallbacksView } from "@S/ServiceDetails/UI/Tabs/Callbacks";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const callbacksStateHelper = CallbacksStateHelper(store);
  const callbacksQueryManager = CallbacksQueryManager(
    apiHelper,
    callbacksStateHelper
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([callbacksQueryManager])
  );

  const callbacksUpdater = new CallbacksUpdater(
    CallbacksStateHelper(store),
    apiHelper
  );
  const deleteCallbackCommandManager = DeleteCallbackCommandManager(
    apiHelper,
    callbacksUpdater
  );

  const createCallbackCommandManager = CreateCallbackCommandManager(
    apiHelper,
    callbacksUpdater
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
  await userEvent.click(deleteButton);

  expect(screen.getByRole("dialog", { name: "Delete Callback" })).toBeVisible();

  const yesButton = screen.getByRole("button", { name: "Yes" });
  await userEvent.click(yesButton);

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
  await userEvent.type(callbackUrlInput, "http://www.example.com/");
  const minimalLogLevelInput = screen.getByRole("button", {
    name: "MinimalLogLevel",
  });
  await userEvent.click(minimalLogLevelInput);
  const criticalOption = screen.getByRole("option", { name: "CRITICAL" });
  await userEvent.click(criticalOption);

  const eventTypesInput = screen.getByRole("button", {
    name: "EventTypes",
  });
  await userEvent.click(eventTypesInput);
  const checkbox = screen.getByRole("checkbox", {
    name: "ALLOCATION_UPDATE",
  });
  await userEvent.click(checkbox);

  const addButton = screen.getByRole("button", {
    name: "Add",
  });
  await userEvent.click(addButton);

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
