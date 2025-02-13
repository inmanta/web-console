import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import {
  dependencies,
  MockEnvironmentHandler,
  MockEnvironmentModifier,
  Service,
} from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { DependencyProvider } from "@/UI/Dependency";
import { Page } from "@S/ServiceDetails/UI/Page";

function setup() {
  const store = getStoreInstance();

  const component = (
    <QueryClientProvider client={testClient}>
      <MemoryRouter initialEntries={[`/lsm/catalog/${Service.a.name}/details`]}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentModifier: new MockEnvironmentModifier(),
            environmentHandler: MockEnvironmentHandler(Service.a.environment),
          }}
        >
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
describe("ServiceCatalog", () => {
  const server = setupServer();

  beforeAll(() => {
    server.use(
      http.get("/lsm/v1/service_catalog/service_name_a", () => {
        return HttpResponse.json({ data: Service.a });
      }),
      http.get("/lsm/v1/service_catalog/service_name_a/config", () => {
        return HttpResponse.json({ data: { test: Service.a.config } });
      }),
    );
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  test("GIVEN ServiceCatalog WHEN click on config tab THEN shows config tab", async () => {
    const { component } = setup();

    render(component);

    const configButton = await screen.findByRole("tab", { name: "Config" });

    await userEvent.click(configButton);

    expect(screen.getByTestId("ServiceConfig")).toBeVisible();
  });

  test("GIVEN ServiceCatalog WHEN config tab is active THEN shows SettingsList", async () => {
    const { component } = setup();

    render(component);
    const configButton = await screen.findByRole("tab", { name: "Config" });

    await userEvent.click(configButton);

    expect(
      await screen.findByRole("generic", { name: "SettingsList" }),
    ).toBeVisible();
  });
});
