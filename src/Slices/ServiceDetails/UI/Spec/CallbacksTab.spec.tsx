import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { HttpResponse, delay, http } from "msw";
import { setupServer } from "msw/node";
import { getShortUuidFromRaw } from "@/Core";
import { QueryResolverImpl, CommandResolverImpl, getStoreInstance } from "@/Data";
import {
  DynamicCommandManagerResolverImpl,
  DynamicQueryManagerResolverImpl,
  Service,
  Callback,
  DeferredApiHelper,
  dependencies,
} from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider } from "@/UI/Dependency";
import {
  CallbacksQueryManager,
  CallbacksStateHelper,
  CallbacksUpdater,
  CreateCallbackCommandManager,
  DeleteCallbackCommandManager,
} from "@S/ServiceDetails/Data";
import { Page } from "@S/ServiceDetails/UI/Page";

const server = setupServer();

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();

  const callbacksStateHelper = CallbacksStateHelper(store);
  const callbacksQueryManager = CallbacksQueryManager(apiHelper, callbacksStateHelper);

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([callbacksQueryManager])
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
    new DynamicCommandManagerResolverImpl([
      deleteCallbackCommandManager,
      createCallbackCommandManager,
    ])
  );

  const component = (
    <QueryClientProvider client={testClient}>
      <MemoryRouter initialEntries={[`/lsm/catalog/${Service.a.name}/details`]}>
        <DependencyProvider dependencies={{ ...dependencies, queryResolver, commandResolver }}>
          <StoreProvider store={store}>
            <Routes>
              <Route path="/lsm/catalog/:service/details" element={<Page />} />
            </Routes>
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
  };
}

test("GIVEN ServiceDetails WHEN click on callbacks tab THEN shows callbacks tab", async () => {
  server.use(
    http.get("/lsm/v1/service_catalog/service_name_a", () => {
      return HttpResponse.json({ data: Service.a });
    }),
    http.get("lsm/v1/callbacks", async () => {
      await delay(500);
      return HttpResponse.json({ data: Callback.list });
    })
  );
  server.listen();
  const shortenUUID = getShortUuidFromRaw(Callback.list[0].callback_id);

  const { component } = setup();

  render(component);

  const callbacksButton = await screen.findByRole("tab", { name: "Callbacks" });

  await userEvent.click(callbacksButton);

  expect(screen.getByRole("region", { name: "Callbacks-Loading" })).toBeVisible();

  expect(await screen.findByRole("grid", { name: "CallbacksTable" })).toBeVisible();
  expect(screen.getByRole("row", { name: "CallbackRow-" + shortenUUID })).toBeVisible();

  server.close();
});
