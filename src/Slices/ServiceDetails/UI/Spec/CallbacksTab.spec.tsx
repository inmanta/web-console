import React from "react";
import { Route, Routes } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { HttpResponse, delay, http } from "msw";
import { setupServer } from "msw/node";
import { getShortUuidFromRaw } from "@/Core";
import { getStoreInstance } from "@/Data";
import { Service, Callback, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Page } from "@S/ServiceDetails/UI/Page";

const server = setupServer();

function setup() {
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={[`/lsm/catalog/${Service.a.name}/details`]}>
        <MockedDependencyProvider>
          <StoreProvider store={store}>
            <Routes>
              <Route path="/lsm/catalog/:service/details" element={<Page />} />
            </Routes>
          </StoreProvider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
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
