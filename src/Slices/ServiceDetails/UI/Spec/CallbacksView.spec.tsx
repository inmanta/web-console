import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { getShortUuidFromRaw } from "@/Core";
import { getStoreInstance } from "@/Data";
import { Service, Callback, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { CallbacksView } from "@S/ServiceDetails/UI/Tabs/Callbacks";

const shortenUUID = getShortUuidFromRaw(Callback.list[0].callback_id);

function setup() {
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <StoreProvider store={store}>
            <ModalProvider>
              <CallbacksView service_entity={Service.a.name} />
            </ModalProvider>
          </StoreProvider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
    store,
  };
}

test("GIVEN CallbacksTab WHEN user fills in form and clicks on Add THEN callback is created", async () => {
  const data = Callback.list;
  const server = setupServer(
    http.get("lsm/v1/callbacks", async () => {
      return HttpResponse.json({ data });
    }),
    http.post("lsm/v1/callbacks", async () => {
      data.push({ ...Callback.a, callback_id: "1234" });
      return HttpResponse.json();
    })
  );
  server.listen();
  const { component } = setup();

  render(component);

  expect(await screen.findByRole("grid", { name: "CallbacksTable" })).toBeVisible();

  expect(screen.getByRole("row", { name: "CallbackRow-" + shortenUUID })).toBeVisible();

  const callbackUrlInput = screen.getByRole("textbox", {
    name: "callbackUrl",
  });

  await userEvent.type(callbackUrlInput, "http://www.example.com/");

  const minimalLogLevelInput = screen.getByRole("combobox", {
    name: "MinimalLogLevelFilterInput",
  });

  await userEvent.click(minimalLogLevelInput);

  const criticalOption = screen.getByRole("option", { name: "CRITICAL" });

  await userEvent.click(criticalOption);

  const eventTypesInput = screen.getByRole("combobox", {
    name: "EventTypesFilterInput",
  });

  await userEvent.click(eventTypesInput);

  const allocationUpdateOption = screen.getByRole("option", {
    name: "ALLOCATION_UPDATE",
  });

  await userEvent.click(allocationUpdateOption);

  const addButton = screen.getByRole("button", {
    name: "Add",
  });

  await userEvent.click(addButton);

  expect(await screen.findByRole("row", { name: "CallbackRow-1234" })).toBeVisible();
  server.close();
});

test("GIVEN CallbacksTab WHEN user click on delete and confirms THEN callback is deleted", async () => {
  let data = Callback.list;
  const server = setupServer(
    http.get("lsm/v1/callbacks", async () => {
      return HttpResponse.json({ data });
    }),
    http.delete("lsm/v1/callbacks/79e7d0b6-5f81-43ce-ade6-a71bc5fb445f", async () => {
      data = data.slice(1);
      return HttpResponse.json();
    })
  );
  server.listen();
  const { component } = setup();

  render(component);

  expect(await screen.findByRole("grid", { name: "CallbacksTable" })).toBeVisible();

  expect(screen.getByRole("row", { name: "CallbackRow-" + shortenUUID })).toBeVisible();

  const deleteButton = await screen.findByRole("button", {
    name: "DeleteCallback-" + shortenUUID,
  });

  await userEvent.click(deleteButton);

  expect(screen.getByRole("dialog", { name: "Delete Callback" })).toBeVisible();

  const yesButton = screen.getByRole("button", { name: "Yes" });

  await userEvent.click(yesButton);

  expect(screen.queryByRole("row", { name: "CallbackRow-" + shortenUUID })).not.toBeInTheDocument();
  server.close();
});
